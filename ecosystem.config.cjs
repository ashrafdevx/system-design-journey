module.exports = {
  apps: [
    {
      name: "system-design-journey",
      script: "./dist/server.js",
      cwd: __dirname,
      instances: 4,
      exec_mode: "cluster",
      node_args: "--env-file-if-exists=.env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
