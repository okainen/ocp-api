import dotenv from 'dotenv';
dotenv.config();

const throwErrorIfEnvVarNotSet = (envVarName: string) => {
  if (!process.env[envVarName]) {
    throw new Error(`Env variable ${envVarName} not set.`);
  }
};

const verifyEnvVars = () => {
  throwErrorIfEnvVarNotSet('HOSTNAME');
  throwErrorIfEnvVarNotSet('PORT');

  throwErrorIfEnvVarNotSet('SIGNED_COOKIE_SECRET');

  throwErrorIfEnvVarNotSet('EMAIL_HOST');
  throwErrorIfEnvVarNotSet('EMAIL_USERNAME');
  throwErrorIfEnvVarNotSet('EMAIL_PASSWORD');

  throwErrorIfEnvVarNotSet('ACCESS_TOKEN_SECRET');
  throwErrorIfEnvVarNotSet('ACCESS_TOKEN_TTL');
  throwErrorIfEnvVarNotSet('REFRESH_TOKEN_TTL_MINS');

  throwErrorIfEnvVarNotSet('ACTIVATION_TOKEN_SECRET');
  throwErrorIfEnvVarNotSet('ACTIVATION_TOKEN_TTL');

  throwErrorIfEnvVarNotSet('EMAIL_RESET_TOKEN_SECRET');
  throwErrorIfEnvVarNotSet('EMAIL_RESET_TOKEN_TTL');

  throwErrorIfEnvVarNotSet('PASSWORD_RESET_TOKEN_SECRET');
  throwErrorIfEnvVarNotSet('PASSWORD_RESET_TOKEN_TTL');

  throwErrorIfEnvVarNotSet('USERS_IMG_DIR');
  throwErrorIfEnvVarNotSet('COURSES_IMG_DIR');
  throwErrorIfEnvVarNotSet('LECTURES_VIDEO_DIR');
  throwErrorIfEnvVarNotSet('READINGS_DOC_DIR');

  throwErrorIfEnvVarNotSet('MONGODB_URL');
};

verifyEnvVars();

export default {
  app: {
    hostname: process.env.HOSTNAME!,
    port: process.env.PORT!,
    email: {
      host: process.env.EMAIL_HOST!,
      username: process.env.EMAIL_USERNAME!,
      password: process.env.EMAIL_PASSWORD!
    },
    signedCookie: {
      secret: process.env.SIGNED_COOKIE_SECRET!
    },
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET!,
      ttl: process.env.ACCESS_TOKEN_TTL!
    },
    refreshToken: {
      ttl: process.env.REFRESH_TOKEN_TTL_MINS!
    },
    activationToken: {
      secret: process.env.ACTIVATION_TOKEN_SECRET!,
      ttl: process.env.ACTIVATION_TOKEN_TTL!
    },
    emailResetToken: {
      secret: process.env.EMAIL_RESET_TOKEN_SECRET!,
      ttl: process.env.EMAIL_RESET_TOKEN_TTL!
    },
    passwordResetToken: {
      secret: process.env.PASSWORD_RESET_TOKEN_SECRET!,
      ttl: process.env.PASSWORD_RESET_TOKEN_TTL!
    },
    users: {
      imgDir: process.env.USERS_IMG_DIR!
    },
    courses: {
      imgDir: process.env.COURSES_IMG_DIR!
    },
    lectures: {
      videoDir: process.env.LECTURES_VIDEO_DIR!
    },
    readings: {
      docDir: process.env.READINGS_DOC_DIR!
    }
  },
  db: {
    mongo: {
      url: process.env.MONGODB_URL!
    }
  }
};