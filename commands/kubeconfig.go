package commands

import (
	"fmt"
	"path"

	"github.com/spf13/cobra"
	"github.com/theblueforest/kiwi-companion/helpers"
)

func init() {
	rootCommand.AddCommand(connectCommand)
}

var connectCommand = &cobra.Command{
	Use:   "kubeconfig",
	Short: "Returns the path of the kubeconfig.yml file",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Print(path.Join(helpers.ConfigsGetKubernetesPath(), "kubeconfig.yml"))
	},
}
