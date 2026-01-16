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

    // API: request report form submissions
    const requestApi = new sst.aws.Function("RequestReport", {
      handler: "api/request-report.handler",
      url: true,
      link: [submissions],
      environment: {
        SUBMISSIONS_BUCKET: submissions.name,
        SES_TO_EMAIL: process.env.SES_TO_EMAIL || "",
      },
    });

    // Deploy the Next.js static site to S3 + CloudFront
    const site = new sst.aws.StaticSite("AireadyLanding", {
      path: "./",
      build: {
        command: "pnpm build",
        output: "out",
      },
      environment: {
        NEXT_PUBLIC_REQUEST_URL: requestApi.url,
      },
      domain: {
        name: "getaiready.dev",
        dns: sst.cloudflare.dns({
          zone: "50eb7dcadc84c58ab34583742db0b671"
        }),
      },
    });

    return {
      site: site.url,
      requestApi: requestApi.url,
      submissionsBucket: submissions.name,
    };
  },
});
