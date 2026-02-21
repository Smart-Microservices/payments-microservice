import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  STRIPE_API_KEY_SECRET: string;
  STRIPE_WEBHOOK_SECRET: string;
  PATH_SUCCESS_URL: string;
  PATH_CANCEL_URL: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_API_KEY_SECRET: joi.string().required(),
    STRIPE_WEBHOOK_SECRET: joi.string().required(),
    PATH_SUCCESS_URL: joi.string().required(),
    PATH_CANCEL_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
}) as { error?: joi.ValidationError; value: EnvVars };

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  stripeApi: {
    keySecret: envVars.STRIPE_API_KEY_SECRET,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  },
  paths: {
    successUrl: envVars.PATH_SUCCESS_URL,
    cancelUrl: envVars.PATH_CANCEL_URL,
  },
};
