package commands

import (
	"fmt"
	"math/rand"

	"github.com/theblueforest/kiwi-companion/values"

	"github.com/docker/docker/client"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/theblueforest/kiwi-companion/operations"
)

func init() {
	rootCommand.AddCommand(upCommand)
}

var upCommand = &cobra.Command{
	Use:   "up",
	Short: "Deploy the Kubernetes server",
	Run: func(cmd *cobra.Command, args []string) {

		// Generate cluster secret
		if viper.Get("clusterSecret") == nil {
			bytes := make([]rune, 20)
			runes := []rune(values.RandomBytes)
			max := len(runes)
			for i := range bytes {
				bytes[i] = runes[rand.Intn(max)]
			}
			viper.Set("clusterSecret", string(bytes))
		}

		// Docker client
		cli, err := client.NewEnvClient()
		if err != nil {
			panic(err)
		}

		// Network
		network := operations.NetworkGet(cli)
		if len(network) == 0 {
			network = operations.NetworkCreate(cli)
		}

		// Server & nodes
		operations.StartKubernetesServer(cli, network)
		operations.StartKubernetesNodes(cli, network, 2)

		fmt.Println("Everything is fine :)")

	},
}
