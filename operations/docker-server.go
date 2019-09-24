package operations

import (
	"context"
	"fmt"
	"io"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/spf13/viper"
	"github.com/theblueforest/kiwi-companion/helpers"
	"github.com/theblueforest/kiwi-companion/values"
)

func checkExistingServer(cli *client.Client) string {
	fmt.Printf("%s", "Checking for an existing server...")

	containers, containersError := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if containersError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(containersError)
	}

	serverID := ""

	for _, container := range containers {
		if container.Names[0] == "/"+values.ServerContainerName {
			serverID = container.ID
		}
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return serverID
}

func pullServerImage(cli *client.Client) {
	fmt.Printf("%s", "Pulling k3s Docker image...")

	pull, pullError := cli.ImagePull(context.Background(), values.ContainerImage, types.ImagePullOptions{})

	if pullError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(pullError)
	}

	pullBytes := make([]byte, 8)
	for {
		_, pullReadErr := pull.Read(pullBytes)
		if pullReadErr == io.EOF {
			break
		}
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

func createServer(cli *client.Client, networkID string) string {
	fmt.Printf("%s", "Creating server container...")

	config := container.Config{
		Image: values.ContainerImage,
		Cmd:   []string{"server", "--disable-agent"},
		Env: []string{
			"K3S_CLUSTER_SECRET=" + viper.GetString("clusterSecret"),
			"K3S_KUBECONFIG_OUTPUT=/var/lib/rancher/k3s/kubeconfig.yml",
			"K3S_KUBECONFIG_MODE=666",
		},
		ExposedPorts: nat.PortSet{
			"6443/tcp": {},
		},
	}

	host := container.HostConfig{
		Mounts: []mount.Mount{
			{Type: mount.TypeBind, Source: helpers.ConfigsGetKubernetesPath(), Target: "/var/lib/rancher/k3s"},
			{Type: mount.TypeBind, Source: "/dev/mapper", Target: "/dev/mapper"},
		},
		PortBindings: nat.PortMap{
			"6443/tcp": []nat.PortBinding{
				{
					HostIP:   "0.0.0.0",
					HostPort: "6443",
				},
			},
		},
	}

	network := network.NetworkingConfig{
		EndpointsConfig: map[string]*network.EndpointSettings{
			values.NetworkName: &network.EndpointSettings{NetworkID: networkID},
		},
	}

	create, createError := cli.ContainerCreate(context.Background(), &config, &host, &network, values.ServerContainerName)
	if createError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(createError)
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return create.ID
}

func isServerRunning(cli *client.Client, serverID string) bool {
	fmt.Printf("%s", "Checking server container state...")

	inspect, inspectError := cli.ContainerInspect(context.Background(), serverID)
	if inspectError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(inspectError)
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return inspect.State.Running
}

func startServer(cli *client.Client, serverID string) {
	fmt.Printf("%s", "Starting server container...")

	startError := cli.ContainerStart(context.Background(), serverID, types.ContainerStartOptions{})
	if startError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(startError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

func stopServer(cli *client.Client, serverID string) {
	fmt.Printf("%s", "Stopping server container...")

	stopError := cli.ContainerStop(context.Background(), serverID, nil)
	if stopError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(stopError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

func removeServer(cli *client.Client, serverID string) {
	fmt.Printf("%s", "Removing server container...")

	removeError := cli.ContainerRemove(context.Background(), serverID, types.ContainerRemoveOptions{})
	if removeError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(removeError)
	}

	fmt.Printf(" %s\n\n", "[OK]")
}

// --------------------------------------------------------------------------------------------------------------------

// StartKubernetesServer : Start Kubernetes server
func StartKubernetesServer(cli *client.Client, networkID string) {
	serverID := checkExistingServer(cli)

	if len(serverID) == 0 {
		pullServerImage(cli)
		serverID = createServer(cli, networkID)
	}

	if !isServerRunning(cli, serverID) {
		startServer(cli, serverID)
	}
}

func RemoveKubernetesServer(cli *client.Client) {
	serverID := checkExistingServer(cli)
	if len(serverID) != 0 {
		if isServerRunning(cli, serverID) {
			stopServer(cli, serverID)
		}
		removeServer(cli, serverID)
	}
}
