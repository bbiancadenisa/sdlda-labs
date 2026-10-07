// A minimal AWS Lambda handler (Node.js 24 runtime).
// Locally it runs inside the official Lambda base image, which includes the
// Runtime Interface Emulator; in Lab 11 the same code is deployed to AWS.
export const handler = async (event) => {
  const name = event?.name ?? 'world';
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${name}!`,
      requestTime: new Date().toISOString(),
    }),
  };
};
