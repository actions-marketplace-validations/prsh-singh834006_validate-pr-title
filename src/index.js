const core = require('@actions/core');
const github = require('@actions/github');

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

        const repository = github.context.payload.pull_request.base.repo.name;

        const client = new github.getOctokit(authToken);

        const {data: pullRequest} = await client.rest.pulls.get({
          owner,
          repository,
          pull_number: github.context.payload.pull_request.number
        });

        const title = pullRequest.title;
        
        core.info(`Pull Request title: "${title}"`);

        const regex = RegExp(valide_pr_regex);

        if (!regex.test(title)) {
            core.setFailed(`Pull Request title "${title}" failed to pass match regex - ${regex}`);
            return
        }

    } catch (error) {
        core.info('Failing here')
        core.setFailed(error.message);
    }
}

run();