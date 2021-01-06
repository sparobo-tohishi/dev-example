// @ts-check

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const AWS = require('aws-sdk');
const yaml = require('yaml');

module.exports = class Deployer {
    /**
     * @param {string[]} argv
     * @return {Deployer}
     */
    static create(argv) {
        const options = this.parseArgv(argv);
        if (!('config' in options) || !('profile' in options) || !('target' in options)) {
            throw new Error(HELP());
        }

        return new this(options);
    }

    /**
     * @param {string[]} argv
     * @return {object}
     */
    static parseArgv(argv) {
        const [, , ...args] = argv;
        const options = {};
        for (let i = 0; i < (args.length / 2); i++) {
            const key = args[i * 2 + 0].replace('--', '');
            const value = args[i * 2 + 1];
            options[key] = value;
        }
        return options;
    }

    /**
     * @param {object} options
     */
    constructor(options) {
        const config = this.loadConfig(options.config);
        const credentials = this.loadCredentials(config.profiles[options.profile]);
        this.configPath = options.config;
        this.profileTag = options.profile;
        this.config = config.targets[options.target];
        this.client = new AWS.Lambda(credentials);
        this.quiet = options.quiet === 'on';
    }

    /**
     * @param {string} filepath
     * @return {object}
     */
    loadConfig(filepath) {
        const content = fs.readFileSync(filepath, {encoding: 'utf-8'});
        return yaml.parse(content);
    }

    /**
     * @param {object} profile
     * @return {object}
     */
    loadCredentials(profile) {
        return {
            region: profile.region,
            accessKeyId: process.env[profile.access_key_id],
            secretAccessKey: process.env[profile.secret_access_key],
        }
    }

    /**
     * @return {Promise<boolean>}
     */
    async deploy() {
        this.putSummary();

        if (!this.quiet && !(await this.prompt())) {
            return true;
        }

        const promises = [];
        const layers = this.targetLayers();
        for (const name in layers) {
            promises.push(this.publishLayer(name, layers[name]))
        }

        const functions = this.targetFunctions();
        for (const name in functions) {
            promises.push(this.updateFunction(name, functions[name]))
        }

        return Promise.all(promises).then(results => {
                this.put(RESULT(results));
                return true;
            });
    }

    putSummary() {
        this.put(
            SUMMARY(
                this.configPath,
                this.profileTag,
                this.targetLayers(),
                this.targetFunctions()
            )
        );
    }

    /**
     * @return {Promise<boolean>}
     */
    prompt() {
        const options = {
            input: process.stdin,
            output: process.stdout,
        };
        const rl = readline.createInterface(options);
        return new Promise(resolve => {
                rl.question(PROMPT(), resolve);
            })
            .then(result => result.toLowerCase() === 'yes')
            .finally(() => rl.close());
    }

    /**
     * @return {object}
     */
    targetLayers() {
        return this.config.layers || {};
    }

    /**
     * @return {object}
     */
    targetFunctions() {
        return this.config.functions || {};
    }

    /**
     * @param {string} layerName
     * @param {string} srcDir
     * @return {Promise<string>}
     */
    async publishLayer(layerName, srcDir) {
        return this.createZipBuffer(srcDir).then(zip => {
            const options = {
                LayerName: layerName,
                Content: {
                    ZipFile: zip,
                },
            };
            return new Promise(resolve => {
                this.client.publishLayerVersion(options, resolve);
            });
        }).then((err) => {
            if (err) {
                throw err;
            }
            return RESULT_OK(layerName);
        }).catch(err => {
            process.stderr.write(err.stack);
            return RESULT_NG(layerName);
        });
    }

    /**
     * @param {string} functionName
     * @param {string} srcDir
     * @return {Promise<string>}
     */
    async updateFunction(functionName, srcDir) {
        return this.createZipBuffer(srcDir).then(zip => {
            const options = {
                FunctionName: functionName,
                ZipFile: zip,
            };
            return new Promise(resolve => {
                this.client.updateFunctionCode(options, resolve);
            });
        }).then((err) => {
            if (err) {
                throw err;
            }
            const options = {
                FunctionName: functionName,
            };
            return new Promise(resolve => {
                this.client.publishVersion(options, resolve);
            });
        }).then((err) => {
            if (err) {
                throw err;
            }
            return RESULT_OK(functionName);
        }).catch(err => {
            process.stderr.write(err.stack);
            return RESULT_NG(functionName);
        });
    }

    /**
     * @param {string} dir
     * @returns {Promise<Buffer>}
     */
    async createZipBuffer(dir) {
        const filename = `${dir.split('/').join('.')}.src.zip`;
        return new Promise(resolve => {
            exec(`zip -r ${filename} ${dir}`, resolve);
        }).then(() => {
            return fs.readFileSync(filename);
        }).finally(() => {
            fs.unlinkSync(filename);
        });
    }

    help() {
        this.put(HELP());
    }

    /**
     * @param {any[]} args
     */
    put(...args) {
        console.log(...args);
    }
}

/**
 * @param {string} config
 * @param {string} profile
 * @param {object} layers
 * @param {object} functions
 * @returns {string}
 */
const SUMMARY = function(config, profile, layers, functions) {
    return `
Env:
${JSON.stringify({config: config, profile: profile}, null, 2)}

Layers:
${JSON.stringify(layers, null, 2)}

Functions:
${JSON.stringify(functions, null, 2)}
`;
}

/**
 * @returns {string}
 */
const PROMPT = function() {
    return 'Deploy ok? (yes/no):';
}

/**
 * @param {string} name
 * @returns {string}
 */
const RESULT_OK = function(name) {
    return `${name}: OK`;
}

/**
 * @param {string} name
 * @returns {string}
 */
const RESULT_NG = function(name) {
    return `${name}: NG`;
}

/**
 * @param {string[]} results
 * @returns {string}
 */
const RESULT = function(results) {
    return `
Result:
${JSON.stringify(results, null, 2)}
`;
}

/**
 * @returns {string}
 */
const HELP = function() {
    return `
Usage:
    deploy --config <config> --profile <profile> --target <target> [--quiet on]

Options:
    --config  : configuration yaml file
    --profile : use aws profile tag
    --target  : deploy target tag
    --quiet   : skip confirm

Configuration:
    \`\`\`yaml
    profiles:
        dev:
          region: ap-northeast-1
          acces_key_id: DEV_ACCESS_KEY_ID
          secret_acces_key: DEV_SECRET_ACCESS_KEY
        stg:
          region: ap-northeast-1
          acces_key_id: STG_ACCESS_KEY_ID
          secret_acces_key: STG_SECRET_ACCESS_KEY
        prd:
          region: ap-northeast-1
          acces_key_id: STG_ACCESS_KEY_ID
          secret_acces_key: STG_SECRET_ACCESS_KEY
    targets:
        all:
            layers: &all_layers
                layer1: src/layers/layer1
                layer2: src/layers/layer2
            functions: &all_functions
                function1: src/lambda/function1
                function2: src/lambda/function2
        layer:
            layers: *all_layers
                <<: 
        function:
            functions: *all_functions
    \`\`\`

Example:
    deploy --config config/deploy.config.yml --profile dev --target all
    deploy --config config/deploy.config.yml --profile dev --target all --quiet on
    deploy --config config/deploy.config.yml --profile dev --target all --quiet on 2>/dev/null
`;
}
