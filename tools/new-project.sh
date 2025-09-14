#!/usr/bin/env bash
set -euo pipefail

# ===== 配置（可改） =====
DEFAULT_TAG="v2025.08.13"   # 默认固定的基线版本标签

usage() {
  echo "用法: $0 <项目名> [--tag <tag>] [--dir <父目录>]"
  echo "示例: $0 pixelArtGenerator --tag v2025.08.13"
  exit 1
}

# 解析参数
PROJECT_NAME="${1:-}"
shift || true
TAG="$DEFAULT_TAG"
PARENT_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)   TAG="${2:-}"; shift 2 ;;
    --dir)   PARENT_DIR="${2:-}"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "未知参数: $1"; usage ;;
  esac
done

[[ -z "${PROJECT_NAME}" ]] && usage

# 必须在基线仓库根目录运行
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "错误：当前目录不是 Git 仓库。请在你的基线仓库根目录运行。"
  exit 2
fi
cd "$REPO_ROOT"

# 读取基线仓库的 origin 地址（作为子模块来源）
if ! BASE_REPO_URL="$(git remote get-url origin 2>/dev/null)"; then
  echo "错误：未找到基线仓库的 origin 远程。请先配置 origin。"
  exit 3
fi

# 默认把新项目建在“基线的上一级目录”
if [[ -z "${PARENT_DIR}" ]]; then
  PARENT_DIR="$(cd "$REPO_ROOT/.." && pwd)"
fi

# 目标目录
TARGET_DIR="${PARENT_DIR%/}/${PROJECT_NAME}"
if [[ -e "$TARGET_DIR" ]]; then
  echo "错误：目录已存在：$TARGET_DIR"
  exit 4
fi

echo ">>> 基线仓库：$REPO_ROOT"
echo ">>> 子模块来源：$BASE_REPO_URL"
echo ">>> 新项目路径：$TARGET_DIR"
echo ">>> 固定基线标签：$TAG"

# 检查标签是否存在于远程
if ! git ls-remote --tags "$BASE_REPO_URL" "refs/tags/${TAG}" >/dev/null 2>&1; then
  echo "错误：在 $BASE_REPO_URL 未找到标签 $TAG"
  echo "提示：可用 --tag <其他tag> 指定，或先在基线仓库打好该 tag 并推送。"
  exit 5
fi

# 创建项目并初始化
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"
git init -b main >/dev/null

# 加入子模块（vendor/base）
git submodule add "$BASE_REPO_URL" vendor/base >/dev/null
git submodule update --init --recursive >/dev/null

# 锁定到指定 tag（detached HEAD）
pushd vendor/base >/dev/null
git fetch --tags origin >/dev/null
git checkout "$TAG" >/dev/null
popd >/dev/null

# 首次提交
echo "# ${PROJECT_NAME}" > README.md
git add .gitmodules vendor/base README.md
git commit -m "init: ${PROJECT_NAME} with base @ ${TAG}" >/dev/null

cat <<TIP

✓ 新项目已创建：$TARGET_DIR
- 子模块路径：vendor/base
- 当前基线版本：$TAG（已锁定）

下一步（可选）：
  1) 在 GitHub 新建仓库 ${PROJECT_NAME}
  2) 关联远程并推送：
     cd "$TARGET_DIR"
     git remote add origin git@github.com:<你的GitHub用户名>/${PROJECT_NAME}.git
     git push -u origin main

升级基线（未来有新 tag 时）：
  cd "$TARGET_DIR"/vendor/base
  git fetch --tags origin
  git checkout <新tag>
  cd ..
  git add vendor/base
  git commit -m "chore: bump base to <新tag>"
  git push

TIP
