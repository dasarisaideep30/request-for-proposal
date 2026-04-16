module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    diagnostic: 'simple_function_works',
    node_version: process.version,
    env_vars_present: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }
  });
};
