from os import mkdir, getcwd
from os.path import basename, dirname, join
from urllib import urlretrieve
import subprocess
import sys

JSTD_URL = "http://js-test-driver.googlecode.com/files/JsTestDriver-1.3.3c.jar"
COVERAGE_URL = "http://js-test-driver.googlecode.com/files/coverage-1.3.3c.jar"

root = getcwd()
jstddir = join(root, "jstestdriver")
pluginsdir = join(jstddir, "plugins")
localjstd = join(jstddir, JSTD_URL.split("/")[-1])
localcoverage = join(pluginsdir, COVERAGE_URL.split("/")[-1])
configpath = join(root, "jstestdriver.conf")

def setup():
    mkdir(jstddir)
    mkdir(pluginsdir)
    print "Downloading", JSTD_URL
    urlretrieve(JSTD_URL, localjstd)
    print "Downloading", COVERAGE_URL
    urlretrieve(COVERAGE_URL, localcoverage)

def runserver():
    print "Launching jstestdriver"
    #--browser opera,google-chrome
    cmd = "java -jar %s --port 2309 --config %s --browser google-chrome" % (localjstd, configpath)
    subprocess.call(cmd.split(" "))

def runtests():
    print "Running tests"
    cmd ="java -jar %s  --config %s --tests all" % (localjstd, configpath)
    subprocess.call(cmd.split(" "))

def main():
    command = None
    if len(sys.argv) > 1:
        command = sys.argv[1]

    commands = ["setup", "runserver", "runtests"]
    if command is None or not command in commands:
        print "Choose a command, one of: setup, runserver, runtests"
        sys.exit(1)
    
    globals()[command]()

main()

