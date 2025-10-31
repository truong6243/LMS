-- Script này tạo dữ liệu mẫu để test hệ thống
-- Chạy script này sau khi đã có cấu trúc database hoàn chỉnh

USE [LMS_Materials]
GO

BEGIN TRANSACTION;

-- 1. Tạo một số Actions bổ sung (ngoài menu đã có)
IF NOT EXISTS (SELECT 1 FROM lms.Actions WHERE ActionCode = 'MATERIAL_DELETE')
BEGIN
    INSERT INTO lms.Actions (ActionCode, ActionName, IsMenu, SortOrder)
    VALUES ('MATERIAL_DELETE', 'Xóa học liệu', 0, 100);
END

-- 2. Tạo Roles mẫu
DECLARE @AdminRoleId INT, @ContentManagerRoleId INT, @ViewerRoleId INT;

-- Role: Admin (toàn quyền)
IF NOT EXISTS (SELECT 1 FROM lms.Roles WHERE RoleCode = 'ADMIN')
BEGIN
    INSERT INTO lms.Roles (RoleCode, RoleName, Description)
    VALUES ('ADMIN', 'Quản trị viên', 'Có toàn quyền trên hệ thống');
    SET @AdminRoleId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @AdminRoleId = RoleId FROM lms.Roles WHERE RoleCode = 'ADMIN';
END

-- Role: Content Manager (quản lý nội dung)
IF NOT EXISTS (SELECT 1 FROM lms.Roles WHERE RoleCode = 'CONTENT_MANAGER')
BEGIN
    INSERT INTO lms.Roles (RoleCode, RoleName, Description)
    VALUES ('CONTENT_MANAGER', 'Quản lý nội dung', 'Upload và quản lý học liệu');
    SET @ContentManagerRoleId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @ContentManagerRoleId = RoleId FROM lms.Roles WHERE RoleCode = 'CONTENT_MANAGER';
END

-- Role: Viewer (chỉ xem)
IF NOT EXISTS (SELECT 1 FROM lms.Roles WHERE RoleCode = 'VIEWER')
BEGIN
    INSERT INTO lms.Roles (RoleCode, RoleName, Description)
    VALUES ('VIEWER', 'Người xem', 'Chỉ được xem học liệu');
    SET @ViewerRoleId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @ViewerRoleId = RoleId FROM lms.Roles WHERE RoleCode = 'VIEWER';
END

-- 3. Gán quyền cho Role Admin (tất cả actions)
DELETE FROM lms.RoleActions WHERE RoleId = @AdminRoleId;
INSERT INTO lms.RoleActions (RoleId, ActionId, CanGrant)
SELECT @AdminRoleId, ActionId, 1
FROM lms.Actions;

-- 4. Gán quyền cho Role Content Manager (upload, manage, delete)
DELETE FROM lms.RoleActions WHERE RoleId = @ContentManagerRoleId;
INSERT INTO lms.RoleActions (RoleId, ActionId, CanGrant)
SELECT @ContentManagerRoleId, ActionId, 0
FROM lms.Actions
WHERE ActionCode IN ('DASHBOARD', 'MATERIALS', 'MATERIALS_VIEW', 'MATERIALS_UPLOAD', 'MATERIALS_MANAGE', 'MATERIAL_DELETE');

-- 5. Gán quyền cho Role Viewer (chỉ xem)
DELETE FROM lms.RoleActions WHERE RoleId = @ViewerRoleId;
INSERT INTO lms.RoleActions (RoleId, ActionId, CanGrant)
SELECT @ViewerRoleId, ActionId, 0
FROM lms.Actions
WHERE ActionCode IN ('DASHBOARD', 'MATERIALS', 'MATERIALS_VIEW');

-- 6. Tạo user admin nếu chưa có (username: admin, password: 123456)
DECLARE @AdminUserId INT;
IF NOT EXISTS (SELECT 1 FROM lms.Users WHERE Username = 'admin')
BEGIN
    INSERT INTO lms.Users (Username, Email, FullName, LegacyPassword, Status)
    VALUES ('admin', 'admin@lms.local', 'Administrator', '123456', 1);
    SET @AdminUserId = SCOPE_IDENTITY();
    
    -- Gán role Admin cho user admin
    INSERT INTO lms.UserRoles (UserId, RoleId)
    VALUES (@AdminUserId, @AdminRoleId);
END
ELSE
BEGIN
    SELECT @AdminUserId = UserId FROM lms.Users WHERE Username = 'admin';
    
    -- Đảm bảo user admin có role Admin
    IF NOT EXISTS (SELECT 1 FROM lms.UserRoles WHERE UserId = @AdminUserId AND RoleId = @AdminRoleId)
    BEGIN
        INSERT INTO lms.UserRoles (UserId, RoleId)
        VALUES (@AdminUserId, @AdminRoleId);
    END
END

-- 7. Tạo user content manager mẫu (username: contentmgr, password: 123456)
DECLARE @ContentMgrUserId INT;
IF NOT EXISTS (SELECT 1 FROM lms.Users WHERE Username = 'contentmgr')
BEGIN
    INSERT INTO lms.Users (Username, Email, FullName, LegacyPassword, Status)
    VALUES ('contentmgr', 'content@lms.local', 'Content Manager', '123456', 1);
    SET @ContentMgrUserId = SCOPE_IDENTITY();
    
    -- Gán role Content Manager
    INSERT INTO lms.UserRoles (UserId, RoleId)
    VALUES (@ContentMgrUserId, @ContentManagerRoleId);
END

-- 8. Tạo một số học liệu mẫu
IF NOT EXISTS (SELECT 1 FROM lms.Materials WHERE Title = 'Hướng dẫn sử dụng React')
BEGIN
    INSERT INTO lms.Materials (Title, Slug, OwnerUserId, Status, HtmlContent, CreatedAt, UpdatedAt)
    VALUES 
    ('Hướng dẫn sử dụng React', 'huong-dan-su-dung-react', @AdminUserId, 3, 
     '<h1>React là gì?</h1><p>React là một thư viện JavaScript để xây dựng giao diện người dùng.</p>', 
     GETDATE(), GETDATE()),
    
    ('Lập trình SQL Server cơ bản', 'lap-trinh-sql-server-co-ban', @AdminUserId, 3,
     '<h1>SQL Server</h1><p>Hướng dẫn lập trình SQL Server từ cơ bản đến nâng cao.</p>',
     GETDATE(), GETDATE()),
    
    ('ASP.NET Web API Tutorial', 'aspnet-web-api-tutorial', @AdminUserId, 0,
     '<h1>ASP.NET Web API</h1><p>Xây dựng RESTful API với ASP.NET.</p>',
     GETDATE(), GETDATE());
END

COMMIT TRANSACTION;

PRINT 'Đã tạo dữ liệu mẫu thành công!';
PRINT 'User admin: admin / 123456';
PRINT 'User content manager: contentmgr / 123456';

-- Hiển thị danh sách roles và permissions
SELECT 'ROLES' as [Type], r.RoleCode, r.RoleName, COUNT(ra.ActionId) as ActionCount
FROM lms.Roles r
LEFT JOIN lms.RoleActions ra ON r.RoleId = ra.RoleId
GROUP BY r.RoleCode, r.RoleName;

-- Hiển thị danh sách materials
SELECT 'MATERIALS' as [Type], MaterialId, Title, Status, UpdatedAt
FROM lms.Materials
ORDER BY MaterialId;
GO
