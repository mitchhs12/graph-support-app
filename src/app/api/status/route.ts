import { NextRequest, NextResponse } from "next/server";

const isValidID = (id: string): boolean => {
  return id.length === 46 && id.startsWith("Qm");
};

// const isValidName = (name: string): boolean => {
//   return name.split("/").length === 2 && !name.startsWith("/") && !name.endsWith("/");
// };

interface Block {
  hash: string;
  number: string;
}

interface SubgraphError {
  message: string;
  block?: Block;
  handler?: string;
  deterministic: boolean;
}

interface ChainIndexingStatus {
  network: string;
  chainHeadBlock?: Block;
  earliestBlock?: Block;
  latestBlock?: Block;
  lastHealthyBlock?: Block;
}

export interface SubgraphIndexingStatus {
  subgraph: string;
  synced: boolean;
  health: "healthy" | "unhealthy" | "failed";
  fatalError?: SubgraphError;
  nonFatalErrors?: SubgraphError[];
  chains: ChainIndexingStatus[];
  entityCount: string;
  node?: string;
}

const QUERY_BODY = `{
  subgraph
  synced
  health
  entityCount
  fatalError {
    handler
    message
    deterministic
    block {
      hash
      number
    }
  }
  chains {
    network
    chainHeadBlock {
      number
      hash
    }
    earliestBlock {
      number
      hash
    }
    latestBlock {
      number
      hash
    }
    lastHealthyBlock {
      hash
      number
    }
  }
  node
}`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url as string);

  // Access the query parameter
  const subgraphID = searchParams.get("subgraphID") as string;

  try {
    const data = await fetchStatus(subgraphID);

    if (data === null) {
      return NextResponse.json({ error: { message: "subgraph not found" } }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: { message: "internal server error" } }, { status: 500 });
  }
}

async function fetchStatus(subgraphID: string): Promise<Array<SubgraphIndexingStatus> | null> {
  if (isValidID(subgraphID)) {
    const query = `{ indexingStatuses(subgraphs:["${subgraphID}"])${QUERY_BODY} }`;
    const data = await queryThegraphIndex(query);
    return data?.indexingStatuses || null;
  }

  const statuses: Array<SubgraphIndexingStatus> = [];

  const currentVersionQuery = `{ indexingStatusForCurrentVersion(subgraphName:"${subgraphID}")${QUERY_BODY} }`;
  const currentVersionData = await queryThegraphIndex(currentVersionQuery);
  if (currentVersionData?.indexingStatusForCurrentVersion) {
    statuses.push(currentVersionData.indexingStatusForCurrentVersion);
  }

  const pendingVersionQuery = `{ indexingStatusForPendingVersion(subgraphName:"${subgraphID}")${QUERY_BODY} }`;
  const pendingVersionData = await queryThegraphIndex(pendingVersionQuery);
  if (pendingVersionData?.indexingStatusForPendingVersion) {
    statuses.unshift(pendingVersionData.indexingStatusForPendingVersion);
  }

  return statuses.length > 0 ? statuses : null;
}

async function queryThegraphIndex(query: string): Promise<any> {
  const response = await fetch("https://api.thegraph.com/index-node/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  return result.data;
}
