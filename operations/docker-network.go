package operations

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/theblueforest/kiwi-companion/values"
)

func NetworkGet(cli *client.Client) string {
	fmt.Printf("%s", "Checking for an existing network...")

	networks, networksError := cli.NetworkList(context.Background(), types.NetworkListOptions{})
	if networksError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(networksError)
	}

	networkID := ""

	for _, network := range networks {
		if network.Name == values.NetworkName {
			networkID = network.ID
		}
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return networkID
}

func NetworkCreate(cli *client.Client) string {
	fmt.Printf("%s", "Creating network...")

	network, networkError := cli.NetworkCreate(context.Background(), values.NetworkName, types.NetworkCreate{})
	if networkError != nil {
		fmt.Printf(" %s\n", "[ERROR]")
		panic(networkError)
	}

	fmt.Printf(" %s\n\n", "[OK]")

	return network.ID
}
