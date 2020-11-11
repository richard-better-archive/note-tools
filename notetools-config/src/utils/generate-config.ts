const baseConfig: GithubActionConfig = {
  name: "note-tools: action",
  on: {
    workflow_dispatch: null, // This allows you to run this workflow at the push if a button
  },
  jobs: {
    noteToolsRun: {
      "runs-on": "ubuntu-latest",
      name: "noteToolsRun",
      "timeout-minutes": 15,
      steps: [],
    },
  },
};

interface GithubActionStepBaseOptions {
  name?: string;
  env?: Record<string, string>;
}

interface GithubActionStepUsesOnly {
  uses: string;
  with?: Record<string, string>;
}

interface GithubActionStepRunCommand {
  run: string;
}

type GithubActionStep =
  | (GithubActionStepRunCommand & GithubActionStepBaseOptions)
  | (GithubActionStepUsesOnly & GithubActionStepBaseOptions);

interface WorkFlowDispatchOptions {}

type WorkFlowDispatch = null | WorkFlowDispatchOptions;

interface GithubActionJob {
  "runs-on": string;
  name: string;
  "timeout-minutes": number;
  steps: GithubActionStep[];
}

interface GithubActionScheduleCronJob {
  cron: string;
}

interface GithubActionTrigger {
  schedule?: GithubActionScheduleCronJob[];
  workflow_dispatch?: WorkFlowDispatch;
}

interface GithubActionConfig {
  name: string;
  on: GithubActionTrigger;
  jobs: Record<string, GithubActionJob>;
}

export const generateConfig = (runAt: string, steps: GithubActionStep[]) => {
  const config = { ...baseConfig };

  config.on.schedule = [{ cron: runAt }];
  config.jobs.noteToolsRun.steps = [...steps];
};
