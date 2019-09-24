package commands

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/theblueforest/kiwi-companion/helpers"
)

var configFile string

var rootCommand = &cobra.Command{
	Use:   "kiwi",
	Short: "Automate your code projects with a unique CLI",
}

func Execute() {
	if err := rootCommand.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)
	rootCommand.PersistentFlags().StringVar(&configFile, "config", "", "config file (default is ~/.kiwi-companion/.config.yaml)")
	rootCommand.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

func initConfig() {
	root := helpers.ConfigsGetRootPath()

	// Directory
	if _, err := os.Stat(root); os.IsNotExist(err) {
		os.Mkdir(root, 0750)
	}

	// Configs
	if configFile != "" {
		viper.SetConfigFile(configFile)
	} else {
		viper.SetConfigName(".config")
		viper.AddConfigPath(root)
	}

	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}
}
