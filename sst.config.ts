/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "aiready-landing",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Storage for report submissions
    const submissions = new sst.aws.Bucket("Submissions", {
      public: false,
    });

    // API Gateway HTTP API for public form submissions
    const api = new sst.aws.ApiGatewayV2("RequestApi", {
      cors: true,
    });

    api.route("POST /", {
      handler: "api/request-report.handler",
      link: [submissions],
      environment: {
        SUBMISSIONS_BUCKET: submissions.name,
        SES_TO_EMAIL: process.env.SES_TO_EMAIL || "",
      },
      permissions: [
        {
          actions: ["ses:SendEmail", "ses:SendRawEmail"],
          resources: ["*"],
        },
      ],
    });

    // Deploy as static site - animations and charts work perfectly in client-side mode
    const site = new sst.aws.StaticSite("AireadyLanding", {
      path: "./",
      build: {
        command: "pnpm build",
        output: "out",
      },
      environment: {
        NEXT_PUBLIC_REQUEST_URL: api.url,
      },
      domain: {
        name: "getaiready.dev",
        dns: sst.cloudflare.dns({
          zone: "50eb7dcadc84c58ab34583742db0b671",
        }),
      },
    });

    return {
      site: site.url,
      apiUrl: api.url,
      submissionsBucket: submissions.name,
    };
  },
});
