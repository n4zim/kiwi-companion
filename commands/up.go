package commands

import (
	"fmt"
	"math/rand"
	"os"

	"github.com/docker/docker/client"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/theblueforest/kiwi-companion/helpers"
	"github.com/theblueforest/kiwi-companion/operations"
	"github.com/theblueforest/kiwi-companion/values"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func init() {
	rootCommand.AddCommand(upCommand)
}

func initStep() {
	// Directory
	dir := helpers.ConfigsGetKubernetesPath()
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.Mkdir(dir, 0750)
	}
}

func configsStep() {
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

	// End of configs
	viper.SafeWriteConfig()
}

func dockerStep() {
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
	operations.StartKubernetesNodes(cli, network, values.DefaultNodesCount)
}

func kubernetesStep() {
	// Kubernetes client
	config, err := clientcmd.BuildConfigFromFlags("", helpers.ConfigsGetKubeconfigPath())
	if err != nil {
		panic(err.Error())
	}

	client, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	/*pods, err := client.CoreV1().Pods("").List(metav1.ListOptions{})
	if err != nil {
		panic(err.Error())
	}*/
	fmt.Printf("%+v\n", client)
}

var upCommand = &cobra.Command{
	Use:   "up",
	Short: "Deploy the Kubernetes server",
	Run: func(cmd *cobra.Command, args []string) {
		initStep()
		configsStep()
		dockerStep()
		kubernetesStep()
		fmt.Println("Everything went fine :)")
	},
}
