import getSession from "@/lib/getSession";
import { OAuth2Client } from "google-auth-library";
import { KubeConfig } from "@kubernetes/client-node";

// Function to initialize Kubernetes client using Google access token
export default async function initializeK8sClient() {
  const session = await getSession();
  const accessToken = session?.accessToken;

  const authClient = new OAuth2Client();

  // Use the access token obtained from OAuth
  authClient.setCredentials({ access_token: accessToken });

  const kubeConfig = new KubeConfig();

  kubeConfig.loadFromOptions({
    clusters: [
      {
        name: "hosted-service",
        server: `https://${process.env.CLUSTER_ENDPOINT}`,
        caData: process.env.CA_DATA,
        skipTLSVerify: false,
      },
    ],
    users: [
      {
        name: "gke_the-graph-production_us-central1-a_hosted-service",
        user: { token: accessToken },
      },
    ],
    contexts: [
      {
        name: "gke_the-graph-production_us-central1-a_hosted-service", // Match your kubectl context
        context: {
          cluster: "hosted-service",
          user: "gke_the-graph-production_us-central1-a_hosted-service",
        },
      },
    ],
    currentContext: "gke_the-graph-production_us-central1-a_hosted-service", // Use your kubectl context
  });

  return kubeConfig;
}
