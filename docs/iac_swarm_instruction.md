# Infrastructure as Code Swarm Instruction — Phyto.ai

Purpose:
Tell the swarm to generate deployable Azure Infrastructure as Code, including the application deployment scaffolding.

---

# Recommended Swarm Instruction

Add this instruction to the swarm launch:

You must generate Infrastructure as Code for Azure as part of the build.

Requirements:
- produce Terraform as the default IaC format
- include Azure infrastructure needed for the application
- include environment separation for dev, staging, and production
- include App Service / Functions, PostgreSQL, Key Vault, Entra auth integration hooks, storage, monitoring, and networking where required by the architecture
- include variables, outputs, remote-state-ready structure, and environment-specific tfvars
- include deployment scaffolding for the application code, not just raw infrastructure
- generate code in a way that can be applied incrementally by phase
- do not generate infrastructure that conflicts with privacy, trust, or exclusion rules in the architecture docs
- ensure secrets are not hardcoded
- include README instructions for terraform init / plan / apply
- include CI/CD-compatible structure
- prefer modular Terraform layout

Output requirements:
- `/infra/terraform/modules/...`
- `/infra/terraform/environments/dev`
- `/infra/terraform/environments/staging`
- `/infra/terraform/environments/prod`
- `/infra/terraform/README.md`
- `/app/` deployment scaffold or deployment hooks
- `/deploy/` scripts or pipeline definitions if needed

Constraint rules:
- do not assume production-scale services before the build roadmap phase justifies them
- phase the infrastructure according to the build roadmap
- treat privacy, geospatial anonymization, and synthetic-data exclusion as infrastructure-relevant concerns
- do not hardcode domains, secrets, or tenant IDs
- expose configuration through variables

Deliverable rule:
At the end of each infrastructure phase, output:
1. Terraform files
2. variable files
3. outputs
4. deployment notes
5. assumptions and unresolved dependencies

---

# Best Practice Notes

## What Terraform should include first
Phase 1 / MVP infra:
- resource groups
- App Service / compute layer
- PostgreSQL
- Key Vault
- Storage
- monitoring/logging
- environment variables / app settings
- identity hooks
- basic networking / security boundaries

## What should come later
- advanced networking
- research-grade export infrastructure
- broad integration infrastructure
- large-scale analytics stacks
- non-essential services

## Application Inclusion Clarification
“Including the application” should usually mean:
- deployment scaffold
- app service/container deployment target
- environment config
- secrets wiring
- CI/CD pipeline hooks

It should not mean:
- the entire app is magically generated from infrastructure alone

The swarm still needs to generate the actual application code separately.

---

# Suggested One-Line Addendum for SWARM_BOOT_FILE.md

The swarm must generate Azure-ready Terraform and application deployment scaffolding as part of implementation, using phased modular Infrastructure as Code aligned to the build roadmap.