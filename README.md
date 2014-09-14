#H
H: HIV Reference Alignment Viewer
--------------------------------- 

A simple viewer for alignments of sequences in respect of a reference.

This component receives a JSON that follows the format of this example

```
{
    "header": {
        "names": ["ref","query"],
        "starts": ["1","1"],
        "alignment_start": 1
    },
    "alignment": [
        ["A", "A"],
        ["C", "C"],
        ["C", "-"],
        ["-", "T"],
        ["G", "G"],
        ["T", "-"],
        ["A", "A"]
    ]
}
```