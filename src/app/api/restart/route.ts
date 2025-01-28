import { Exec } from "@kubernetes/client-node";
import getSession from "@/lib/getSession"; // Import your custom getSession function
import { NextRequest, NextResponse } from "next/server";
import { Writable } from "stream";
import initializeK8sClient from "@/lib/kubeConfig";

const executeCommands = async (namespace: string, podName: string, containerName: string, subgraphId: string) => {
  const kubeConfig = await initializeK8sClient();

  const exec = new Exec(kubeConfig);

  const stdoutData: string[] = [];
  const stderrData: string[] = [];

  const stdout = new Writable({
    write: (chunk, encoding, callback) => {
      stdoutData.push(chunk.toString());
      console.log(`[STDOUT]: ${chunk.toString()}`);
      callback();
    },
  });

  const stderr = new Writable({
    write: (chunk, encoding, callback) => {
      stderrData.push(chunk.toString());
      console.error(`[STDERR]: ${chunk.toString()}`);
      callback();
    },
  });
  const command = `graphman restart ${subgraphId}`;

  const args = [`sh`, "-c", command];
  console.log(`Executing command: ${command}`);
  try {
    await exec.exec(namespace, podName, containerName, args, stdout, stderr, null, true);
    console.log("finished executing");
    return {
      success: true,
      stdout: stdoutData.join(""),
      stderr: stderrData.join(""),
    };
  } catch (error: any) {
    console.error("Command execution failed:", error);
    return {
      success: false,
      error: error.message,
      stdout: stdoutData.join(""),
      stderr: stderrData.join(""),
    };
  }
};

// Example API route to get pod information from Kubernetes
export async function POST(req: NextRequest) {
  try {
    // Retrieve the session to get the Google access token
    const session = await getSession();
    const accessToken = session?.accessToken;
    const { subgraphId } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: { message: "Access token not found" } }, { status: 401 });
    }

    const podName = process.env.PODNAME;
    const namespace = process.env.NAMESPACE; // Target namespace
    const containerName = process.env.CONTAINER_NAME;

    if (!podName || !namespace || !containerName) {
      return NextResponse.json({ error: { message: "Environment variables not found" } }, { status: 500 });
    }

    // Initialize Kubernetes client
    const result = await executeCommands(namespace, podName, containerName, subgraphId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
