package helpers

import (
	"fmt"
	"os"
	"path"

	"github.com/mitchellh/go-homedir"
	"github.com/theblueforest/kiwi-companion/values"
)

func ConfigsGetRootPath() string {
	home, err := homedir.Dir()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	return path.Join(home, values.RootNameDir)
}

func ConfigsGetKubernetesPath() string {
	return path.Join(ConfigsGetRootPath(), values.KubernetesNameDir)
}

func ConfigsGetKubeconfigPath() string {
	return path.Join(ConfigsGetKubernetesPath(), "kubeconfig.yml")
}
