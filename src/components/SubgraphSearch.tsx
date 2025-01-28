"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { SubgraphIndexingStatus } from "@/app/api/status/route";
import { Button } from "@/components/ui/button";
import ClipboardButton from "./CopyClipboard";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { formatTimeAgo, checkBlockHash, modifyNodeName } from "@/lib/utils";

// export interface SubgraphIndexingStatus {
//   subgraph: string;
//   synced: boolean;
//   health: "healthy" | "unhealthy" | "failed";
//   fatalError?: SubgraphError;
//   nonFatalErrors?: SubgraphError[];
//   chains: ChainIndexingStatus[];
//   entityCount: string;
//   node?: string;
// }

async function handleRestart(subgraphId: string) {
  try {
    const response = await fetch(`/api/restart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subgraphId }),
    });
    if (response.ok) {
      console.log("Subgraph restarted successfully!");
    } else {
      console.error("Failed to restart subgraph.");
    }
  } catch (error) {
    console.error("Error restarting subgraph:", error);
  }
}

async function handleRewind(subgraphId: string, blockHash: string, blockNumber: number) {
  try {
    const response = await fetch(`/api/rewind`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subgraphId, blockHash, blockNumber }),
    });
    if (response.ok) {
      console.log("Subgraph restarted successfully!");
    } else {
      console.error("Failed to restart subgraph.");
    }
  } catch (error) {
    console.error("Error restarting subgraph:", error);
  }
}

async function handleReassign(subgraphId: string, newNode: string) {
  try {
    const response = await fetch(`/api/reassign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subgraphId, newNode }),
    });
    if (response.ok) {
      console.log("Subgraph restarted successfully!");
    } else {
      console.error("Failed to restart subgraph.");
    }
  } catch (error) {
    console.error("Error restarting subgraph:", error);
  }
}

export default function SubgraphSearch() {
  const [subgraphID, setSubgraphID] = useState(""); // To store the input value
  const [result, setResult] = useState<SubgraphIndexingStatus | null>(null); // To store the result from the API
  const [newBlockNumber, setNewBlockNumber] = useState(0);
  const [newBlockHash, setNewBlockHash] = useState("");
  const [newIndexNode, setNewIndexNode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveTime, setLiveTime] = useState<string | null>(null);
  const [lastFetchedTime, setLastFetchedTime] = useState<Date | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const COOLDOWN = 40000; // 40 seconds

  // Re-render the countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetchedTime) {
        // Trigger a re-render by updating state
        setLiveTime(formatTimeAgo(new Date(lastFetchedTime)));
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [lastFetchedTime]);

  const handleSearch = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed, running function...");
      setIsLoading(true);
      if (!subgraphID) {
        console.log("Please enter a valid subgraph ID.");
        return;
      }

      try {
        // Make a GET request to your API route
        const response = await fetch(`/api/status?subgraphID=${subgraphID}`);
        if (response.ok) {
          const data = await response.json();
          setResult(data.data[0]); // Handle the response and set it to state
          const now = new Date();
          setLastFetchedTime(now); // Use a function to format the time difference
          setLiveTime(formatTimeAgo(now));
        } else {
          console.error("Failed to fetch subgraph data.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Countdown timer for cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(prev - 1000, 0)); // Decrease cooldown by 1 second
      }, 1000);
    }
    return () => clearInterval(timer); // Clean up timer
  }, [cooldown]);

  return (
    <div className="flex flex-col max-w-6xl w-full px-10 gap-3">
      <h1 className="flex justify-center text-2xl">Subgraph Search</h1>
      <div>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search for a subgraph"
            disabled={isLoading}
            value={subgraphID}
            onChange={(e) => setSubgraphID(e.target.value)} // Update the state on input change
            onKeyDown={handleSearch} // Trigger the function on key down
          />
          {isLoading && (
            <div className="absolute right-3 inset-y-0 flex items-center">
              <LoaderCircle className="animate-spin text-gray-500" />
            </div>
          )}
        </div>
        {liveTime && <div className="text-sm text-gray-500">{`Last fetched ${liveTime} ago`}</div>}
      </div>

      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-6">
              <div className="flex gap-3 items-center">
                <div className="flex w-full gap-3 items-center truncate">
                  <h2>ID:</h2>
                  <p className="truncate">{result.subgraph}</p>
                </div>
                <ClipboardButton textToCopy={result.subgraph} />
              </div>
              <div className="flex gap-3 items-center">
                <h2>Sync Status:</h2>
                <p>{result.synced === true ? <CircleCheck /> : <CircleX />}</p>
              </div>
              <div className="flex gap-3 items-center">
                <h2>Health:</h2>
                <p>{result.health}</p>
              </div>
              <div className="flex gap-3">
                <h2>Entity Count:</h2>
                <p>{result.entityCount}</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex w-full gap-3 items-center truncate">
                  <h2>Node:</h2>
                  <p>{result.node}</p>
                </div>
                <ClipboardButton textToCopy={result.node!} />
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex w-full gap-3 items-center truncate">
                  <h2>Chain:</h2>
                  <p>{result.chains[0].network}</p>
                </div>
                <ClipboardButton textToCopy={result.chains[0].network} />
              </div>
            </div>
            <div className="border border-primary/50" />
            <div className="flex flex-col gap-3">
              {result.chains[0].earliestBlock ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 items-center">
                    <div className="flex w-full gap-3 items-center truncate">
                      <h2 className="text-nowrap">Subgraph earliest block number:</h2>
                      <p className="truncate">{result.chains[0].earliestBlock.number}</p>
                    </div>
                    <ClipboardButton textToCopy={result.chains[0].earliestBlock.number} />
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex w-full gap-3 items-center truncate">
                      <h2 className="text-nowrap">Subgraph earliest block hash:</h2>
                      <p className="truncate">{result.chains[0].earliestBlock.hash}</p>
                    </div>
                    <ClipboardButton textToCopy={result.chains[0].earliestBlock.hash} />
                  </div>
                </div>
              ) : (
                <div>Chain head block couldn&apos;t be found!</div>
              )}
              {result.chains[0].latestBlock ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 items-center">
                    <div className="flex w-full gap-3 items-center truncate">
                      <h2 className="text-nowrap">Subgraph latest block number:</h2>
                      <p className="truncate">{result.chains[0].latestBlock.number}</p>
                    </div>
                    <div className="flex justify-end">
                      <ClipboardButton textToCopy={result.chains[0].latestBlock.number} />
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex w-full gap-3 items-center truncate">
                      <h2 className="text-nowrap">Subgraph latest block hash:</h2>
                      <p className="truncate">{`0x${result.chains[0].latestBlock.hash}`}</p>
                    </div>
                    <div className="flex justify-end">
                      <ClipboardButton textToCopy={`0x${result.chains[0].latestBlock.hash}`} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>Subgraph latest block couldn&apos;t be found!</div>
              )}
              {result.chains[0].chainHeadBlock ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 items-center w-full">
                    <div className="flex w-full gap-3 items-center truncate">
                      <h2 className="text-nowrap">Chain head block number:</h2>
                      <p className="truncate">{result.chains[0].chainHeadBlock.number}</p>
                    </div>
                    <div className="flex justify-end">
                      <ClipboardButton textToCopy={result.chains[0].chainHeadBlock.number} />
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex w-full gap-3 items-center truncate">
                      <h2 className="text-nowrap">Chain head block hash:</h2>
                      <div className="truncate">{`0x${result.chains[0].chainHeadBlock.hash}`}</div>
                    </div>
                    <div className="flex justify-end">
                      <ClipboardButton textToCopy={`0x${result.chains[0].chainHeadBlock.hash}`} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>Chain head block couldn&apos;t be found!</div>
              )}
            </div>
            <div>
              {result.chains[0].latestBlock && result.chains[0].chainHeadBlock && result.chains[0].earliestBlock ? (
                <div className="flex gap-3">
                  <h2>Sync Percentage</h2>
                  <p
                    className={`font-bold ${
                      (
                        ((parseInt(result.chains[0].latestBlock.number) -
                          parseInt(result.chains[0].earliestBlock.number)) /
                          (parseInt(result.chains[0].chainHeadBlock.number) -
                            parseInt(result.chains[0].earliestBlock.number))) *
                        100
                      ).toFixed(2) === "100.00"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {(
                      ((parseInt(result.chains[0].latestBlock.number) -
                        parseInt(result.chains[0].earliestBlock.number)) /
                        (parseInt(result.chains[0].chainHeadBlock.number) -
                          parseInt(result.chains[0].earliestBlock.number))) *
                      100
                    ).toFixed(2)}
                    % (
                    {parseInt(result.chains[0].chainHeadBlock.number) - parseInt(result.chains[0].latestBlock.number)}{" "}
                    blocks behind)
                  </p>
                </div>
              ) : (
                <div>Sync percentage couldn&apos;t be calculated!</div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6 md:flex-row w-full justify-center">
            <div className="w-full">
              <Button
                onClick={() => {
                  handleRestart(result.subgraph);
                  setCooldown(COOLDOWN);
                }}
                className="w-full"
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Cooldown: ${Math.ceil(cooldown / 1000)}s` : "Restart Subgraph"}
              </Button>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Input
                type="text"
                placeholder={`New Node${result.node ? ` (e.g. ${modifyNodeName(result.node)})` : ""}`}
                onChange={(e) => setNewIndexNode(e.target.value)}
              />
              <Button
                disabled={newIndexNode ? cooldown > 0 : true}
                onClick={() => {
                  handleReassign(result.subgraph, newIndexNode);
                  setCooldown(COOLDOWN);
                }}
                className="w-full"
              >
                {cooldown > 0 ? `Cooldown: ${Math.ceil(cooldown / 1000)}s` : "Reassign Subgraph"}
              </Button>
            </div>
            <div className="w-full">
              <div className="flex flex-col w-full gap-3">
                <Input
                  type="number"
                  placeholder="New block number"
                  onChange={(e) => setNewBlockNumber(parseInt(e.target.value))}
                />
                <Input type="text" placeholder="New block hash" onChange={(e) => setNewBlockHash(e.target.value)} />
                {result.chains[0].earliestBlock && result.chains[0].latestBlock && (
                  <Button
                    disabled={
                      newBlockNumber
                        ? newBlockNumber >= parseInt(result.chains[0].earliestBlock.number) &&
                          newBlockNumber < parseInt(result.chains[0].latestBlock.number) &&
                          checkBlockHash(newBlockHash)
                          ? cooldown > 0
                          : true
                        : true
                    }
                    onClick={() => {
                      handleRewind(result.subgraph, newBlockHash, newBlockNumber);
                      setCooldown(COOLDOWN);
                    }}
                    className="w-full"
                  >
                    {cooldown > 0 ? `Cooldown: ${Math.ceil(cooldown / 1000)}s` : "Rewind Subgraph"}
                  </Button>
                )}
              </div>
            </div>

            {/* <div> <Button
              onClick={() => {
                checkAllocation(result.subgraph);
              }}
              className="w-full"
            >
              Check Allocation
            </Button> </div>*/}
          </div>
        </div>
      )}
    </div>
  );
}
