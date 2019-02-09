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
	[isAdmin] tinyint NOT NULL DEFAULT 0, -- 是否是管理员
	[create_time] bigint NOT NULL, -- 创建时间（时间戳）
	[creator_id] integer NOT NULL, -- 创建人ID
	[modify_time] bigint NOT NULL, -- 修改时间（时间戳）
	[modifier_id] integer NOT NULL -- 修改人ID
);
```
