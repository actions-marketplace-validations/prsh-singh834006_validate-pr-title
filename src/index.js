const core = require('@actions/core');
const github = require('@actions/github');
const lint = require('@commitlint/lint').default;
const load = require('@commitlint/load').default;

const CONFIG = {
  extends: ['@commitlint/config-conventional'],
};

const validEvent = ['pull_request'];

const valide_pr_regex = '(feature|fix|build|release|hotfix)/((RCRA|CML|EDR|PTS)-[0-9])'

async function run() {
    try {
        const authToken = core.getInput('GITHUB_TOKEN', {required: true})

        const eventName = github.context.eventName;

        core.info(`Event name: ${eventName}`);

        if (validEvent.indexOf(eventName) < 0) {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const owner = github.context.payload.pull_request.base.user.login;

        const repo = github.context.payload.pull_request.base.repo.name;

        const client = new github.getOctokit(authToken);

        const {data: pullRequest} = await client.rest.pulls.get({
          owner,
          repo,
          pull_number: github.context.payload.pull_request.number
        });

        const title = pullRequest.title;
        
        core.info(`Pull Request title: "${title}"`);

        const { valid } = await load(CONFIG).then((options) => lint(title, options.rules, options.parserPreset ? {parserOpts: options.parserPreset.parserOpts} : {}))

        if (!valid) {
            core.setFailed(`Pull Request title "${title}" doesn't match conventional commit message`);
            return
        }

        console.log('passing')

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();