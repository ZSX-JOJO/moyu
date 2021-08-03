export default [{
    name: "新增文件夹",
    icon: "#iconxinzengwenjian",
    op: "addRootFolder",
    shortcut: [],
    pin: true,
}, {
    name: "新增文件",
    icon: "#iconwenjian",
    op: "addRootFile",
    shortcut: [],
    pin: true,
}, {
    name: "刷新banner",
    icon: "#iconshuaxin",
    op: "freshBanner",
    shortcut: [],
    pin: true,
}, {
    name: "在线链接",
    icon: "#iconlink",
    op: "generateLink",
    shortcut: ["Ctrl", "L"],
    pin: true,
}, {
    name: "回收站",
    icon: "#iconhuishouzhan",
    op: "recycler",
    shortcut: ["Ctrl", "Alt", "R"],
    pin: true,
}, {
    name: "预览文档",
    icon: "#iconyulan",
    op: "viewDoc",
    shortcut: ["Ctrl", "P"],
    pin: false,
}, {
    name: "导出文档",
    icon: "#icondaochu1",
    op: "exportDoc",
    shortcut: ["Ctrl", "E"],
    pin: false,
}, {
    name: "导入文档",
    icon: "#icondaoru",
    op: "importDoc",
    shortcut: ["Ctrl", "I"],
    pin: false,
}, {
    name: "历史记录",
    icon: "#iconlishi",
    op: "history",
    shortcut: ["Ctrl", "H"],
    pin: false,
}, {
    name: "全局设置",
    icon: "#iconshezhi",
    op: "config",
    shortcut: ["Ctrl", ","],
    pin: false,
}];
