# 数据表设计

本文档用于记录该 API 项目中 Sqlite 数据库的表结构

## 用户信息表（user）

```sql
CREATE TABLE [user] (
	[id] integer NOT NULL PRIMARY KEY AUTOINCREMENT, -- 自增ID
	[username] varchar(50) NOT NULL, -- 用户名
	[password] varchar(200) NOT NULL, -- 密码
	[display_name] varchar(50) NOT NULL, -- 显示名称（昵称）
  [user_avatar] varchar(500), -- 用户头像
	[department] varchar(200),  -- 部门
	[email] varchar(200),  -- 邮箱
	[is_admin] tinyint NOT NULL DEFAULT 0, -- 是否是管理员
	[create_time] bigint NOT NULL, -- 创建时间（时间戳）
	[creator_id] integer NOT NULL, -- 创建人ID
	[modify_time] bigint NOT NULL, -- 修改时间（时间戳）
	[modifier_id] integer NOT NULL -- 修改人ID
);
```

## 操作日志表（sys_log）

```sql
CREATE TABLE [sys_log] (
	[id] integer NOT NULL PRIMARY KEY AUTOINCREMENT, -- 自增ID
	[group_id] varchar(50) NOT NULL, -- 组ID
	[server] varchar(50) NOT NULL, -- 服务器
	[type] varchar(50) NOT NULL, -- 操作类型
	[content] varchar(2000), -- 日志内容
	[creator_id] integer NOT NULL, -- 创建者ID
	[create_time] bigint NOT NULL -- 创建时间
);
```

## 服务器Group（group）

```sql
CREATE TABLE [group] (
	[id] integer NOT NULL PRIMARY KEY AUTOINCREMENT, -- 自增ID
	[group_id] varchar(50), -- 组ID
	[group_name] varchar(200) NOT NULL, -- 组名称
	[group_desc] varchar(2000), -- 组描述
	[open_to_public] tinyint NOT NULL DEFAULT 0, -- 是否开放
	[is_cluster] tinyint NOT NULL DEFAULT 0, -- 是否是集群模式
	[owners] varchar(4000) NOT NULL, -- 管理员列表
	[servers] varchar(4000) NOT NULL, -- 服务器列表
	[contact] varchar(200), -- 联系人
	[creator_id] integer NOT NULL, -- 创建人ID
	[create_time] bigint NOT NULL, -- 创建时间
	[modifier_id] integer NOT NULL, -- 修改人ID
	[modify_time] bigint NOT NULL, -- 修改时间
	[is_deleted] tinyint NOT NULL DEFAULT 0 -- 是否已删除
);
```

## 数据字典表（data_dict）

```sql
CREATE TABLE [data_dict] (
	[id] integer NOT NULL PRIMARY KEY AUTOINCREMENT, -- 自增ID
	[data_key] varchar(50) NOT NULL, -- 数据KEY
	[data_value] varchar(2000) NOT NULL, -- 数据Value
	[create_time] bigint NOT NULL, -- 创建时间
	[creator_id] integer NOT NULL, -- 创建人ID
	[modify_time] bigint NOT NULL, -- 修改时间
	[modifier_id] integer NOT NULL -- 修改人ID
);
```
