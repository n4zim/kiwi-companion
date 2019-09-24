
# Kiwi Companion

## Start Kubernetes cluster
```bash
kiwi up
```

## Attach the kubectl CLI to the cluster
```bash
kiwi kubeconfig | sh
```

## Remove Kubernetes cluster
```bash
kiwi down
```

## Delete all cluster data
```bash
sudo rm -r ~/.kiwi-companion/k3s
```
