package commands

import (
	"fmt"

	"github.com/docker/docker/client"
	"github.com/spf13/cobra"
	"github.com/theblueforest/kiwi-companion/operations"
)

func init() {
	rootCmd.AddCommand(upCmd)
}

var upCmd = &cobra.Command{
	Use:   "up",
	Short: "Deploy the Kubernetes server",
	Run: func(cmd *cobra.Command, args []string) {
		cli, err := client.NewEnvClient()
		if err != nil {
			panic(err)
		}

		network := operations.NetworkGet(cli)
		if len(network) == 0 {
			network = operations.NetworkCreate(cli)
		}

		operations.StartKubernetesServer(cli, network)
		operations.StartKubernetesNodes(cli, network, 2)

		fmt.Println("Everything is fine :)")
	},
}
