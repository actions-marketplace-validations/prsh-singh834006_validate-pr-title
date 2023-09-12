const core = require('@actions/core');
const github = require('@actions/github');

const REGEX_PATTERN = /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test){1}(\([\w\-\.]+\))?(!)?: ([\w ])+([\s\S]*)/i

const validEvent = ['pull_request'];

async function run() {
    try {
        const authToken = core.getInput('GITHUB_TOKEN', { required: true })

        const eventName = github.context.eventName;

        core.info(`Event: ${eventName}`);

        if (validEvent.indexOf(eventName) < 0) {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const owner = github.context.payload.pull_request.base.user.login;

        const repo = github.context.payload.pull_request.base.repo.name;

        const client = new github.getOctokit(authToken);

        const { data: pullRequest } = await client.rest.pulls.get({
          owner,
          repo,
          pull_number: github.context.payload.pull_request.number
        });

        const title = pullRequest.title;
        
        core.info(`PR Title: "${title}"`);
        
   
        if (!REGEX_PATTERN.test(title)) {
            core.setFailed(`Pull Request title "${title}" doesn't match conventional commit message`);
            return
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();