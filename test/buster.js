var config = module.exports;

config["Unbose tests"] = {
    rootPath: "../",
    environment: "browser",
    sources: [
        "src/unbose.js",
    ],
    tests: [
        "test/*-test.js"
    ]
}