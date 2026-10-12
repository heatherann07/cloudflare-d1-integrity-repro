# Separate unresolved storage attribution question

A separate restricted local-runtime diagnostic observed an additional set of files
classified as sqlite_like, sqlite_shm_like and sqlite_wal_like, with another basename
from the mapped database. Workerd open-file matches were observed for them.

Those observations do not establish that the files belong to the application's D1
binding, identify another object, or prove runtime ownership. File suffixes, storage
location and process handles alone are insufficient attribution evidence.

This minimal reproduction does not enumerate storage files and has NOT reproduced
that observation. It should not be presented as a reproduction of that separate
question. Is there a supported binding/object-to-storage mapping API for local D1,
or documented guidance for attributing additional files without internal APIs?
