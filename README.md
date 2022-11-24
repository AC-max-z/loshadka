
# Car positions history load tests

> INB4 found clickhouse-benchmark tool which pretty much does what was necessary with no need to reinvent the wheel. Hence this one is unfinished bicycle 😏  
> Maybe someday somehow something will be useful tho...or not
## Load scenarios list

- **goal:** define clickhouse cluster capacity for simultaneous INSERT and SELECT queries
    (at which rate we will experience failures/errors)
- **reason:** to be sure we can process production rate of car position events stream
    and save them to CH storage for history data with no bottlenecks.
    Tweak batch size/request rate (insert) on pro according to this investigation results
    And determine at which rate of SELECT queries we should scale things up or whatever
- **approach:** generate prod like car position data, send insert queries to CH
    gradually increasing the rate of queries until we start experiencing errors
- **metrics:** TBD
- **checks:** TBD

## How to use

TBD
