package commands

import (
	"fmt"

	"github.com/docker/docker/client"
	"github.com/spf13/cobra"
	"github.com/theblueforest/kiwi-companion/operations"
)

func init() {
	rootCommand.AddCommand(downCommand)
}

var downCommand = &cobra.Command{
	Use:   "down",
	Short: "Deletes everything for a reset",
	Run: func(cmd *cobra.Command, args []string) {

		// Docker client
		cli, err := client.NewEnvClient()
		if err != nil {
			panic(err)
		}

		// Server
		operations.RemoveKubernetesServer(cli)

		// Nodes
		operations.RemoveKubernetesNodes(cli)

		// Network
		networkID := operations.NetworkGet(cli)
		if len(networkID) != 0 {
			operations.NetworkRemove(cli, networkID)
		}

		fmt.Println("Everything is clean !")

	},
}
