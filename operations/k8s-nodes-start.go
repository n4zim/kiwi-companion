package operations

import (
	"context"
	"fmt"
	"regexp"
	"strconv"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

var nodeContainerName = "kiwi-node"
var nodeContainerImage = "rancher/k3s:latest"

func getExistingNodes(cli *client.Client, count int) map[int]string {
	fmt.Printf("%s", "Checking for existing nodes...")

	containers, containersError := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if containersError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(containersError)
	}

	nodeIDs := map[int]string{}
	for i := 1; i <= count; i++ {
		nodeIDs[i] = ""
	}

	for _, container := range containers {
		regex := regexp.MustCompile(nodeContainerName + `(\d+)`)
		match := regex.FindStringSubmatch(container.Names[0])
		if match != nil {
			number, numberError := strconv.Atoi(match[1])
			if numberError != nil {
				fmt.Printf(" %s\n", "[ERROR]")
				panic(numberError)
			}
			nodeIDs[number] = container.ID
		}
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return nodeIDs
}

func isNodeRunning(cli *client.Client, number int, nodeID string) bool {
	fmt.Printf("%s %d %s", "Checking node", number, "container state...")

	inspect, inspectError := cli.ContainerInspect(context.Background(), nodeID)
	if inspectError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(inspectError)
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return inspect.State.Running
}

func createNode(cli *client.Client, number int) string {
	fmt.Printf("%s %d %s", "Creating node", number, "container...")

	config := container.Config{
		Image: serverContainerImage,
	}

	host := container.HostConfig{}

	network := network.NetworkingConfig{}

	create, createError := cli.ContainerCreate(context.Background(), &config, &host, &network, nodeContainerName+strconv.Itoa(number))
	if createError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(createError)
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return create.ID
}

func startNode(cli *client.Client, number int, nodeID string) {
	fmt.Printf("%s %d %s", "Starting node", number, "container...")

	startError := cli.ContainerStart(context.Background(), nodeID, types.ContainerStartOptions{})
	if startError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(startError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

func stopNode(cli *client.Client, number int, nodeID string) {
	fmt.Printf("%s %d %s", "Stopping node", number, "container...")

	stopError := cli.ContainerStop(context.Background(), nodeID, nil)
	if stopError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(stopError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

func removeNode(cli *client.Client, number int, nodeID string) {
	fmt.Printf("%s %d %s", "Deleting node", number, "container...")

	removeError := cli.ContainerRemove(context.Background(), nodeID, types.ContainerRemoveOptions{})
	if removeError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(removeError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

// StartKubernetesNodes : Start Kubernetes nodes
func StartKubernetesNodes(cli *client.Client, count int) {
	for number, ID := range getExistingNodes(cli, count) {
		if number <= count {
			if len(ID) == 0 { // No existing node
				createNode(cli, number)
				startNode(cli, number, ID)
			} else if !isNodeRunning(cli, number, ID) { // Node not running
				startNode(cli, number, ID)
			}
		} else { // Not needed node
			if isNodeRunning(cli, number, ID) { // Node is running
				stopNode(cli, number, ID)
			}
			removeNode(cli, number, ID)
		}
	}
}
