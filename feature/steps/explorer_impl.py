from behave import *
import os
import compose_util

@when(u'I start explorer')
def start_explorer_impl(context):
    curpath = os.path.realpath('.')
    composeFiles = ["%s/docker-compose/docker-compose-explorer.yaml" % (curpath)]
    if not hasattr(context, "composition_explorer"):
        context.composition_explorer = compose_util.Composition(context, composeFiles,
                                                                projectName=context.composition.projectName,
                                                                startContainers=True)
    else:
        context.composition_explorer.composeFilesYaml = composeFiles
        context.composition_explorer.up()
    context.compose_containers = context.composition.collectServiceNames()

