/ := $(dir $(abspath $(MAKEFILE_LIST)))

ifeq ($(OS), Windows_NT)
	PATH := $/node_modules\.bin;$(PATH)
else
	PATH := $/node_modules/.bin:$(PATH)
endif

rwildcard = $(foreach d,$(wildcard $(1:=/*)),$(call rwildcard,$d,$2)$(filter $(subst *,%,$2),$d))

bin/index.js: $(call rwildcard,src,*.ts)
	rollup -c
