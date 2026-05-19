import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AUTH0_AUDIENCE) {
    throw new Error("AUTH0_AUDIENCE environment variable is required");
}

if (!process.env.AUTH0_DOMAIN) {
    throw new Error("AUTH0_DOMAIN environment variable is required");
}

export const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE, // Must match your Auth0 API audience
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`, // Your Auth0 tenant domain
});
