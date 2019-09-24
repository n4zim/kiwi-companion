package operations

import (
	"context"
	"fmt"
	"regexp"
	"strconv"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/spf13/viper"
	"github.com/theblueforest/kiwi-companion/values"
)

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
		regex := regexp.MustCompile(values.NodeContainerName + `(\d+)`)
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

func createNode(cli *client.Client, networkID string, number int) string {
	fmt.Printf("%s %d %s", "Creating node", number, "container...")

	config := container.Config{
		Image: values.ContainerImage,
		Env: []string{
			"K3S_URL=https://kiwi-server:6443",
			"K3S_CLUSTER_SECRET=" + viper.GetString("clusterSecret"),
		},
	}

	host := container.HostConfig{
		Privileged: true,
		Tmpfs:      map[string]string{"/run": "", "/var/run": ""},
		Mounts: []mount.Mount{
			{Type: mount.TypeBind, Source: "/lib/modules", Target: "/lib/modules"},
			{Type: mount.TypeBind, Source: "/var/run/docker.sock", Target: "/var/run/docker.sock"},
		},
	}

	network := network.NetworkingConfig{
		EndpointsConfig: map[string]*network.EndpointSettings{
			values.NetworkName: &network.EndpointSettings{NetworkID: networkID},
		},
	}

	create, createError := cli.ContainerCreate(context.Background(), &config, &host, &network, values.NodeContainerName+strconv.Itoa(number))
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
	fmt.Printf("%s %d %s", "Removing node", number, "container...")

	removeError := cli.ContainerRemove(context.Background(), nodeID, types.ContainerRemoveOptions{})
	if removeError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(removeError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

// StartKubernetesNodes : Start Kubernetes nodes
func StartKubernetesNodes(cli *client.Client, networkID string, count int) {
	for number, nodeID := range getExistingNodes(cli, count) {
		if number <= count {
			if len(nodeID) == 0 { // No existing node
				nodeID := createNode(cli, networkID, number)
				startNode(cli, number, nodeID)
			} else if !isNodeRunning(cli, number, nodeID) { // Node not running
				startNode(cli, number, nodeID)
			}
		} else { // Not needed node
			if isNodeRunning(cli, number, nodeID) { // Node is running
				stopNode(cli, number, nodeID)
			}
			removeNode(cli, number, nodeID)
		}
	}
}

func RemoveKubernetesNodes(cli *client.Client) {
	for number, ID := range getExistingNodes(cli, 0) {
		if isNodeRunning(cli, number, ID) { // Node is running
			stopNode(cli, number, ID)
		}
		removeNode(cli, number, ID)
	}
}
