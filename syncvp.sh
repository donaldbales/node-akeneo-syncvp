#!/bin/bash

export LOG_LEVEL=info
export PIM1_AKENEO_EXPORT_PATH=data/pim1
mkdir -p $PIM1_AKENEO_EXPORT_PATH
export PIM2_AKENEO_EXPORT_PATH=data/pim2
mkdir -p $PIM2_AKENEO_EXPORT_PATH

#
# From
#

export PIM1_AKENEO_BASE_URL="http://pimee6-ubuntu-20-215.donaldbales.com"
export PIM1_AKENEO_CLIENT_ID=1_n2wr1jy53kgcg40occw4co0kckw40k04ggoko0ggg0sswgwkc
export PIM1_AKENEO_PASSWORD=e06b306b6
export PIM1_AKENEO_SECRET=59g0nl76j08w4sk80w84sgokkkk8wc4ccoc4k4k8g4kwcwk8sg
export PIM1_AKENEO_USERNAME=pim1_2335

#
# To
#

export PIM2_AKENEO_BASE_URL="http://pimee6-ubuntu-20-216.donaldbales.com"
export PIM2_AKENEO_CLIENT_ID=1_3yug4z87zpeswck4cokkogws8kso40soo8cwskgskokow8ww8k
export PIM2_AKENEO_PASSWORD=dbe6461d3
export PIM2_AKENEO_SECRET=1f1jolrkdhtwckc8g4s8o0ow004c4so4g8s0g0ws844kcw4g48
export PIM2_AKENEO_USERNAME=pim2_7383

node --max-old-space-size=16384 --unhandled-rejections=strict src/index
