use(function () {
    return {
        results: node.session.workspace.queryManager.createQuery("select * from [sling:Folder] as n", "JCR-SQL2").execute().getNodes())
    };
});
