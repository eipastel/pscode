# Github Workflows

## Testing CI Locally

Test GitHub Actions workflows locally using [act](https://nektosact.com/):

```bash
# Test all PR checks
act pull_request

# Test a specific job
act pull_request -j test_pr

# Dry run to see what would execute
act pull_request --dryrun
```

The `.actrc` file configures act to use the appropriate Docker image.


