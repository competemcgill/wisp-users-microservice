VERSION_PREFIX := ""
GIT_SHA := $(shell git rev-parse HEAD | cut -c1-8)

ifneq ($(shell git rev-parse --abbrev-ref HEAD), master)
	VERSION_PREFIX := "dev-"
endif

.PHONY: version

version: 
	@sed -i "/appVersion:/c\appVersion: $(VERSION_PREFIX)$(GIT_SHA)" chart/wisp-users/Chart.yaml