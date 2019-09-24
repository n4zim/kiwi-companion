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
)

var serverContainerName = "kiwi-server"
var serverContainerImage = "rancher/k3s:latest"

func checkExistingServer(cli *client.Client) string {
	fmt.Printf("%s", "Checking for existing server...")

	containers, containersError := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if containersError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(containersError)
	}

	serverID := ""

	for _, container := range containers {
		if container.Names[0] == "/"+serverContainerName {
			serverID = container.ID
		}
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return serverID
}

func pullServerImage(cli *client.Client) {
	fmt.Printf("%s", "Pulling k3s Docker image...")

	pull, pullError := cli.ImagePull(context.Background(), serverContainerImage, types.ImagePullOptions{})

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

func createServer(cli *client.Client) string {
	fmt.Printf("%s", "Creating server container...")

	config := container.Config{
		Image: serverContainerImage,
		Cmd:   []string{"server", "--disable-agent"},
		Env: []string{
			"K3S_CLUSTER_SECRET=dropin-test",
			"K3S_KUBECONFIG_OUTPUT=/kubeconfig.yml",
			"K3S_KUBECONFIG_MODE=666",
		},
		ExposedPorts: nat.PortSet{
			"6443/tcp": {},
		},
	}

	host := container.HostConfig{
		Mounts: []mount.Mount{
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

	network := network.NetworkingConfig{}

	create, createError := cli.ContainerCreate(context.Background(), &config, &host, &network, serverContainerName)
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

// StartKubernetesServer : Start Kubernetes server
func StartKubernetesServer(cli *client.Client) {
	serverID := checkExistingServer(cli)

	if len(serverID) == 0 {
		pullServerImage(cli)
		serverID = createServer(cli)
	}

	if !isServerRunning(cli, serverID) {
		startServer(cli, serverID)
	}
}
