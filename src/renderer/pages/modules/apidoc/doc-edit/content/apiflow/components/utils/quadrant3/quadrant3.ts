import { store } from "@/store";
import { getNodeStickyArea, getLineStickyPosition, getContraryPosition } from "../common/common";
import type { ResultRect, Coordinate, LineDrawInfoOptions, LineConfig } from "../utils"

type Options = LineDrawInfoOptions & {
    startPoint: Coordinate,
    endPoint: Coordinate,
    lineConfig: LineConfig
}
type GetArrowInfoOptions = {
    position: "left"| "right" | "top" | "bottom";
    arrowLength: number;
    arrowWidth: number;
}
/*
|--------------------------------------------------------------------------
| 到达toNode时候线条绘制
|--------------------------------------------------------------------------
*/
//绘制箭头
const getDrawArrowInfo = (point: Coordinate, options: GetArrowInfoOptions): Coordinate[] => {
    const arrowList: Coordinate[] = [];
    const { position, arrowLength, arrowWidth } = options;
    if (position === "right") {
        arrowList[0] = {
            x: point.x,
            y: point.y - arrowWidth
        };
        arrowList[1] = {
            x: point.x,
            y: point.y + arrowWidth
        };
        arrowList[2] = {
            x: point.x + arrowLength,
            y: point.y
        }
    } else if (position === "bottom") {
        arrowList[0] = {
            x: point.x - arrowWidth,
            y: point.y
        };
        arrowList[1] = {
            x: point.x + arrowWidth,
            y: point.y
        };
        arrowList[2] = {
            x: point.x,
            y: point.y + arrowLength
        }
    } else if (position === "left") {
        arrowList[0] = {
            x: point.x,
            y: point.y - arrowWidth
        };
        arrowList[1] = {
            x: point.x,
            y: point.y + arrowWidth
        };
        arrowList[2] = {
            x: point.x - arrowLength,
            y: point.y
        }
    } else if (position === "top") {
        arrowList[0] = {
            x: point.x - arrowWidth,
            y: point.y
        };
        arrowList[1] = {
            x: point.x + arrowWidth,
            y: point.y
        };
        arrowList[2] = {
            x: point.x,
            y: point.y - arrowLength
        }
    }
    return arrowList
}
//当右侧线条与其他节点吸附时候，改变线条绘制路径
const drawRightLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: (stickyArea.leftArea.pointX - startPoint.x) / 2 + padding,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: (stickyArea.leftArea.pointX - startPoint.x) / 2 + padding,
                y: stickyArea.leftArea.pointY - result.y
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.leftArea.pointX - result.x - arrowLength,
                y: stickyArea.leftArea.pointY - result.y
            });
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            const gapX = toNode.styleInfo.offsetX - fromNode.styleInfo.offsetX - fromNode.styleInfo.width; //fromNode右侧距离toNode左侧距离
            result.width = stickyArea.topArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: result.height - padding
            });
            if (gapX >= 0 && gapX <= breakLineOffsetNode * 2) {
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x + gapX / 2,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x + gapX / 2,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                });
            } else if (gapX < 0) {
                result.width = toNode.styleInfo.offsetX + toNode.styleInfo.width - fromNode.styleInfo.width - fromNode.styleInfo.offsetX + breakLineOffsetNode + 2 * padding
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                })
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x + breakLineOffsetNode,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x + breakLineOffsetNode,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                });
            }
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.topArea.pointX - result.x,
                y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.topArea.pointX - result.x,
                y: stickyArea.topArea.pointY - result.y - padding
            });
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = stickyArea.bottomArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding;
            result.y = stickyArea.bottomArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.bottomArea.pointX - startPoint.x + padding,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.bottomArea.pointX - startPoint.x + padding,
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startPoint.x + padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            result.width = stickyArea.rightArea.pointX - startPoint.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.y = stickyArea.rightArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.rightArea.pointX - startPoint.x + padding + breakLineOffsetNode,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.rightArea.pointX - startPoint.x + padding + breakLineOffsetNode,
                y: stickyArea.rightArea.pointY - result.y
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.rightArea.pointX - startPoint.x + padding * 2,
                y: stickyArea.rightArea.pointY - result.y
            });
            lineEndPoint.x = stickyArea.rightArea.pointX - startPoint.x + padding * 2;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
//当上侧线条与其他节点吸附时候，改变线条绘制路径
const drawTopLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding - arrowLength,
                y: padding
            });
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = stickyArea.topArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode - arrowLength
            });
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = stickyArea.bottomArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding;
            result.y = stickyArea.bottomArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startPoint.x + padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            const gapY = Math.abs(toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY) - fromNode.styleInfo.height; //fromNode右侧距离toNode左侧距离
            result.width = stickyArea.rightArea.pointX - startPoint.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.y = stickyArea.rightArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapY < padding) {
                result.height = Math.abs(startPoint.y - toNode.styleInfo.offsetY) + 2 * padding + breakLineOffsetNode;
                result.y = toNode.styleInfo.offsetY - padding - breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - result.x + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - gapY / 2
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding - gapY / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - result.x + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            }
            lineEndPoint.x = stickyArea.rightArea.pointX - startPoint.x + padding * 2;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
//当左侧线条与其他节点吸附时候，改变线条绘制路径
const drawLeftLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    const fromNodeStyleInfo = fromNode.styleInfo;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startPoint.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (stickyArea.leftArea.pointX > fromNodeStyleInfo.offsetX + fromNodeStyleInfo.width && stickyArea.leftArea.pointY > fromNodeStyleInfo.offsetY) {
                result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
                result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - breakLineOffsetNode - arrowLength,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - breakLineOffsetNode - arrowLength,
                    y: endPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: endPoint.y - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - arrowLength,
                    y: padding
                });
            }
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = stickyArea.topArea.pointX - startPoint.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            console.log(2)
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode - arrowLength
            });
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = stickyArea.bottomArea.pointX - startPoint.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding;
            result.y = stickyArea.bottomArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startPoint.x + padding + breakLineOffsetNode;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            const gapY = Math.abs(toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY) - fromNode.styleInfo.height;
            result.width = stickyArea.rightArea.pointX - startPoint.x + 2 * padding + breakLineOffsetNode * 2;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.y = stickyArea.rightArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapY < padding) {
                result.height = Math.abs(startPoint.y - toNode.styleInfo.offsetY) + 2 * padding + breakLineOffsetNode;
                result.y = stickyArea.rightArea.pointY - padding;
                result.lineInfo.brokenLinePoints.push({
                    x: breakLineOffsetNode + padding,
                    y: Math.abs(endPoint.y - startPoint.y) + padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: Math.abs(endPoint.y - startPoint.y) + padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - breakLineOffsetNode + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height / 2
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - breakLineOffsetNode + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            }
            lineEndPoint.x = result.width - padding - breakLineOffsetNode + arrowLength;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
//当底部线条与其他节点吸附时候，改变线条绘制路径
const drawBottomLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (stickyArea.leftArea.pointX - fromNode.styleInfo.offsetX - fromNode.styleInfo.width > 2 * (breakLineOffsetNode + arrowLength)) {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - breakLineOffsetNode - padding - arrowLength,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - breakLineOffsetNode - padding - arrowLength,
                    y: stickyArea.leftArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.leftArea.pointX - result.x - arrowLength,
                    y: stickyArea.leftArea.pointY - result.y
                });
            } else if (stickyArea.leftArea.pointX > fromNode.styleInfo.offsetX + fromNode.styleInfo.width) {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: (stickyArea.leftArea.pointX - fromNode.styleInfo.offsetX) / 2 + arrowLength,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: (stickyArea.leftArea.pointX - fromNode.styleInfo.offsetX) / 2 + arrowLength,
                    y: stickyArea.leftArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.leftArea.pointX - result.x - arrowLength,
                    y: stickyArea.leftArea.pointY - result.y
                });
            } else {
                result.width = endPoint.x - fromNode.styleInfo.offsetX + breakLineOffsetNode + 2 * padding;
                result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding + breakLineOffsetNode;
                result.x = fromNode.styleInfo.offsetX - breakLineOffsetNode - padding;
                result.y = stickyArea.leftArea.pointY - padding;
                result.lineInfo.brokenLinePoints.push({
                    x: fromNode.styleInfo.width / 2 + padding + breakLineOffsetNode,
                    y: result.height - padding - breakLineOffsetNode
                });
                result.lineInfo.brokenLinePoints.push({
                    x: fromNode.styleInfo.width / 2 + padding + breakLineOffsetNode,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - arrowLength,
                    y: padding
                });
            }
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            const gapX = toNode.styleInfo.offsetX - fromNode.styleInfo.offsetX - fromNode.styleInfo.width; //fromNode右侧距离toNode左侧距离
            console.log("top", gapX, endPoint.y < fromNode.styleInfo.offsetY)
            result.width = stickyArea.topArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + 2 * breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            if (gapX >= 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode,
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding + fromNode.styleInfo.width / 2 + gapX / 2,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + fromNode.styleInfo.width / 2 + gapX / 2,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.topArea.pointX - result.x,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.topArea.pointX - result.x,
                    y: stickyArea.topArea.pointY - result.y - padding
                });
            } else if (gapX < 0 && endPoint.y < fromNode.styleInfo.offsetY) {
                result.width = Math.abs(fromNode.styleInfo.offsetX - stickyArea.topArea.pointX) + breakLineOffsetNode + 2 * padding
                result.height = Math.abs(endPoint.y - startPoint.y) + 2 * breakLineOffsetNode + 2 * padding
                result.x = fromNode.styleInfo.offsetX - padding - breakLineOffsetNode;
                result.y = endPoint.y - padding - breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: toNode.styleInfo.width / 2 + padding + breakLineOffsetNode,
                    y: result.height - padding - breakLineOffsetNode
                })
                result.lineInfo.brokenLinePoints.push({
                    x: toNode.styleInfo.width / 2 + padding + breakLineOffsetNode,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding + breakLineOffsetNode - arrowLength
                })
            } else {
                result.width = endPoint.x - fromNode.styleInfo.offsetX + breakLineOffsetNode + 2 * padding
                result.height = fromNode.styleInfo.height + 2 * breakLineOffsetNode + 2 * padding
                result.x = fromNode.styleInfo.offsetX - padding - breakLineOffsetNode;
                result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: toNode.styleInfo.width / 2 + padding + breakLineOffsetNode,
                    y: result.height - padding - breakLineOffsetNode
                })
                result.lineInfo.brokenLinePoints.push({
                    x: toNode.styleInfo.width / 2 + padding + breakLineOffsetNode,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: endPoint.y - result.y - arrowLength
                })
            }
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = stickyArea.bottomArea.pointX - startPoint.x + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.bottomArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - breakLineOffsetNode
            });
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.bottomArea.pointX - startPoint.x + padding,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.bottomArea.pointX - startPoint.x + padding,
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startPoint.x + padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            const gapX = stickyArea.rightArea.pointX - fromNode.styleInfo.offsetX - fromNode.styleInfo.width
            result.width = fromNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.rightArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapX > 0) {
                result.width = Math.abs(startPoint.x - stickyArea.rightArea.pointX) + 2 * padding + breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - startPoint.x + padding * 2,
                    y: stickyArea.rightArea.pointY - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode
                });
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - startPoint.x + padding * 2,
                    y: stickyArea.rightArea.pointY - result.y
                });
            }
            lineEndPoint.x = stickyArea.rightArea.pointX - startPoint.x + padding * 2;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
/*
|--------------------------------------------------------------------------
| fromNode四个点引出线条绘制
|--------------------------------------------------------------------------
*/
//右侧线条
const drawRightLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, breakLineSticky, arrowLength, arrowWidth } } = options;
    const breakLineWidth = Math.abs(result.width - 2 * padding); //折线宽度
    const breakLineHeight = Math.abs(result.height - 2 * padding); //折线高度
    /*
        示例如下：
                   |‾‾‾‾‾‾‾‾‾‾‾‾‾
        ___________|
    */
    if (breakLineWidth > breakLineHeight) {
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineWidth / 2,
            y: result.height - padding
        })
        if (Math.abs(result.height - 2 * padding) < breakLineSticky) { //折线往上移动吸附效果
            result.lineInfo.brokenLinePoints.push({
                x: Math.abs(result.width - padding),
                y: result.height - padding
            })
            const arrowList = getDrawArrowInfo({
                x: result.width - padding,
                y: result.height - padding
            }, {
                position: "right",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineWidth / 2,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: Math.abs(result.width - padding),
                y: padding
            })
            const arrowList = getDrawArrowInfo({
                x: result.width - padding,
                y: padding
            }, {
                position: "right",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
        }
    } else {
        /*
        示例如下：
                |
                |
                |
                |
            ____|
        */
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineWidth,
            y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineWidth,
            y: padding
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: padding
        }, {
            position: "top",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
    }
}
//顶部线条
const drawTopLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endPoint } = options;
    /*
                示例如下：A点到B点范围外，线条方向共2种
       A
       |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                          |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                             |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
       |                    |                          |                      |                             |                      |
       |    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|        |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|            |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
       |    |               p                 |        |     |                p                |            |     |                p                |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |               case1             |            |     |               case2             |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |                                 |    ________|     |                                 |
       |    |                                 |       end    |                                 |   end            |                                 |
       |    |_________________________________|              |_________________________________|                  |_________________________________|
       |                    |
       |____________________|
                            B

    */
    const p = {
        x: fromNode.styleInfo.width / 2 + fromNode.styleInfo.offsetX,
        y: fromNode.styleInfo.offsetY
    }
    const endPWidth = Math.abs(endPoint.x - p.x);
    const endPHeight = Math.abs(endPoint.y - p.y);
    if (endPWidth > fromNode.styleInfo.width / 2 + breakLineOffsetNode) {
        result.width = endPWidth + 2 * padding;
        result.height = endPHeight + breakLineOffsetNode + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - breakLineOffsetNode - padding
        if (endPWidth < endPHeight) { //如图case1
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            const arrowList = getDrawArrowInfo({
                x: padding,
                y: result.height - padding,
            }, {
                position: "bottom",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: 0,
                y: result.height - 2 * padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: 2 * padding,
                y: result.height
            }
        } else { //如同case2
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: breakLineOffsetNode + padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: breakLineOffsetNode + padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            const arrowList = getDrawArrowInfo({
                x: padding,
                y: result.height - padding,
            }, {
                position: "left",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: 0,
                y: result.height - 2 * padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: 2 * padding,
                y: result.height
            }
        }
    } else {
        /*
                示例如下：A点到B点范围内，线条方向共2种
            A
            |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                          |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                             |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
            |                    |                          |                      |                             |                      |
            |    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|        |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|            |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
            |    |               p                 |        |     |                p                |            |     |                p                |
            |    |                                 |        |     |                                 |            |     |                                 |
            |    |                                 |        |_____|____end                          |            |_____|____________                     |
            |    |                                 |              |               case1             |                  |            |  case2             |
            |    |                                 |              |                                 |                  |            |                    |
            |    |                                 |              |                                 |                  |            |                    |
            |    |                                 |              |                                 |                  |           end                   |
            |    |                                 |              |                                 |                  |                                 |
            |    |_________________________________|              |_________________________________|                  |_________________________________|
            |                    |
            |____________________|
                                    B

        */
        result.width = fromNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode;
        result.height = endPHeight + breakLineOffsetNode + 2 * padding;
        result.x = fromNode.styleInfo.offsetX - breakLineOffsetNode - padding;
        result.y = fromNode.styleInfo.offsetY - breakLineOffsetNode - padding;
        if (endPWidth > endPHeight) { //如图case1
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: endPoint.x - result.x,
                y: result.height - padding,
            })
            const arrowList = getDrawArrowInfo({
                x: endPoint.x - result.x,
                y: result.height - padding
            }, {
                position: "right",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: endPoint.x - result.x - padding,
                y: result.height - padding * 2
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: endPoint.x - result.x + padding,
                y: result.height
            }
        } else { //如图case2
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: endPoint.x - result.x,
                y: result.height - padding - breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: endPoint.x - result.x,
                y: result.height - padding,
            })
            const arrowList = getDrawArrowInfo({
                x: endPoint.x - result.x,
                y: result.height - padding,
            }, {
                position: "bottom",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: endPoint.x - result.x - padding,
                y: result.height - padding * 2
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: endPoint.x - result.x + padding,
                y: result.height
            }
        }
    }
}
//左侧线条
const drawLeftLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
    /*
                 示例如下：
                 |‾‾‾‾‾‾‾‾‾‾‾‾‾|                      |‾‾‾‾‾‾‾‾‾‾‾‾‾|
                 |             |                      |             |
           |-----| p  case1    |                |-----| p  case2    |
           |     |             |                |     |             |
           |     |_____________|          ______|     |_____________|
           |                             end
           |
          end
    */
    const p = {
        x: fromNode.styleInfo.offsetX,
        y: fromNode.styleInfo.height / 2 + fromNode.styleInfo.offsetY
    }
    const endPWidth = Math.abs(endPoint.x - p.x);
    const endPHeight = Math.abs(endPoint.y - p.y);
    if (endPHeight > endPWidth) { //case1
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding - arrowLength
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding - arrowLength
        }, {
            position: "bottom",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    } else {
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width / 2,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width / 2,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding
        }, {
            position: "left",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    }
}
//底部线条
const drawBottomLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
    /*
        示例如下：

               |‾‾‾‾‾‾‾‾‾‾‾‾|                     |‾‾‾‾‾‾‾‾‾‾‾‾‾|
               |            |                     |             |
               |    case1   |                     |    case2    |
               |            |                     |             |
               |______p_____|                     |______p______|
                      |                                  |
        ______________|                                  |
       end                                               |
                                           ______________|
                                           |
                                           |
                                           |
                                          end
    */
    const p = {
        x: fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2,
        y: fromNode.styleInfo.height + fromNode.styleInfo.offsetY
    }
    const endPWidth = Math.abs(endPoint.x - p.x);
    const endPHeight = Math.abs(endPoint.y - p.y);
    if (endPWidth * 0.618 > endPHeight) { //case1
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding
        }, {
            position: "left",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    } else {
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: result.height / 2,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height / 2
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding
        }, {
            position: "bottom",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    }
}
/*
|--------------------------------------------------------------------------
|
|--------------------------------------------------------------------------
*/
export const getQuardantInfo3 = (result: ResultRect, options: Options): void => {
    const { startPoint, endPoint, lineConfig: { padding }, fromPosition } = options;
    //第一步，确定canvas位置和宽高
    result.x = startPoint.x - padding;
    result.y = endPoint.y - padding
    result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - startPoint.y) + 2 * padding;
    //第二步，确定箭头可拖拽区域
    result.lineInfo.arrowInfo.leftTopPoint = {
        x: result.width - padding * 2,
        y: 0
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
        x: result.width,
        y: padding * 2
    }
    //第三步，根据线条引出时候位置，绘制线条
    if (fromPosition === "right") { //第一象限，从节点右侧引出线条
        drawRightLineWhenDrag(result, options);
        drawRightLineWhenStick(result, options);
    } else if (fromPosition === "top") { //第一象限，从节点顶部引出线条
        drawTopLineWhenDrag(result, options);
        drawTopLineWhenStick(result, options);
    } else if (fromPosition === "left") { //第一象限，从节点左侧引出线条
        drawLeftLineWhenDrag(result, options);
        drawLeftLineWhenStick(result, options);
    } else if (fromPosition === "bottom") { //第一象限，从节点下侧引出线条
        drawBottomLineWhenDrag(result, options);
        drawBottomLineWhenStick(result, options);
    }
}
