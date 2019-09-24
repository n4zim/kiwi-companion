package commands

import (
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
		// Docker Client
		cli, err := client.NewEnvClient()
		if err != nil {
			panic(err)
		}

		// Operations
		operations.StartKubernetesServer(cli)

	},
}
