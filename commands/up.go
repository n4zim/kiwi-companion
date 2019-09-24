package commands

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
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(upCmd)
}

func startKubernetes(cli *client.Client) {
	fmt.Printf("%s", "Checking for existing server...")

	containers, containersError := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if containersError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(containersError)
	}

	serverName := "kiwi-server"
	serverID := ""

	for _, container := range containers {
		if container.Names[0] == "/"+serverName {
			serverID = container.ID
		}
	}

	fmt.Printf(" %s\n\n", "[OK]")

	if len(serverID) == 0 {

		serverImage := "rancher/k3s:latest"

		fmt.Printf("%s", "Pulling k3s Docker image...")
		pull, pullError := cli.ImagePull(context.Background(), serverImage, types.ImagePullOptions{})
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

		fmt.Printf("%s", "Creating server container...")

		config := container.Config{
			Image: serverImage,
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

		create, createError := cli.ContainerCreate(context.Background(), &config, &host, &network, serverName)
		if createError != nil {
			fmt.Printf(" %s\n", "[ERROR]")
			panic(createError)
		}

		serverID = create.ID

		fmt.Printf(" %s\n\n", "[OK]")

	}

	fmt.Printf("%s", "Checking server container state...")

	inspect, inspectError := cli.ContainerInspect(context.Background(), serverID)
	if inspectError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(inspectError)
	}

	fmt.Printf(" %s\n\n", "[OK]")

	if !inspect.State.Running {
		fmt.Printf("%s", "Starting server container...")

		startError := cli.ContainerStart(context.Background(), serverID, types.ContainerStartOptions{})
		if startError != nil {
			fmt.Printf(" %s\n", "[ERROR]")
			panic(startError)
		}

		fmt.Printf(" %s\n\n", "[OK]")
	}

	// fmt.Printf("%+v\n", )
}

var upCmd = &cobra.Command{
	Use:   "up",
	Short: "Deploy the Kubernetes server",
	Run: func(cmd *cobra.Command, args []string) {
		// Docker Client
		cli, err := client.NewEnvClient()
		if err != nil {
			panic(err)
		}

		// Operations
		startKubernetes(cli)

	},
}
