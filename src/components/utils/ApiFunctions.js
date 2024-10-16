import axios from "axios"

export const api = axios.create({
	baseURL: "http://localhost:9090"
})

export const getHeader = () => {
	const token = localStorage.getItem("token")
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json"
	}
}

export async function checkRoleAdmin(token) {
	try {
		const response = await api.get("/auth/check-role", {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});

		if (response.status >= 200 && response.status < 300) {
			const { role } = response.data;
			return role === "ROLE_ADMIN";
		} else {
			throw new Error(`Role check failed with status: ${response.status}`);
		}
	} catch (error) {
		console.error("Role check error:", error);
		return false;
	}
}

export async function loginAdmin(login) {
	try {
		const response = await api.post("/auth/login", login);
		if (response.status >= 200 && response.status < 300) {
			const token = response.data.token;
			const adminData = response.data;

			if (token) {
				localStorage.setItem("token", token);
				localStorage.setItem("adminId", adminData.id);
				localStorage.setItem("adminEmail", adminData.email);
				localStorage.setItem("adminFirstName", adminData.firstName);
				localStorage.setItem("adminLastName", adminData.lastName);
				localStorage.setItem("adminAvatar", adminData.avatar);

				const isAdmin = await checkRoleAdmin(token);
				if (isAdmin) {
					return adminData;
				} else {
					localStorage.removeItem("token");
					throw new Error("Access restricted to admins only.");
				}
			} else {
				throw new Error("No token received from server");
			}
		} else {
			throw new Error(`Login failed with status: ${response.status}`);
		}
	} catch (error) {
		console.error("Login error:", error);
		return null;
	}
}

export async function registerAdmin(registration) {
	try {
		const response = await api.post("/auth/register", registration)
		return response.data
	} catch (error) {
		if (error.reeponse && error.response.data) {
			throw new Error(error.response.data)
		} else {
			throw new Error(`Admin registration error : ${error.message}`)
		}
	}
}

export async function getAdmin(adminId, token) {
	try {
		const response = await api.get(`/admin/show-profile-${adminId}`, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		throw error
	}
}
export async function getAllRoles() {
	try {
		const result = await api.get("/admin/roles/all", {
			headers: getHeader(),
		});
		if (result.status === 204 || !result.data || result.data.length === 0) {
			return [];
		}
		return result.data;
	} catch (error) {
		console.error("Error fetching roles:", error);
		throw new Error(`Error fetching roles: ${error.response?.data?.message || error.message}`);
	}
}

export async function getAllCategories() {
	try {
		const result = await api.get("/admin/category/all", {
			headers: getHeader(),
		});
		if (result.status === 204 || !result.data || result.data.length === 0) {
			return [];
		}
		return result.data;
	} catch (error) {
		console.error("Error fetching categories:", error);
		throw new Error(`Error fetching categories: ${error.response?.data?.message || error.message}`);
	}
}

export async function createCategory(categoryName, description) {
    const data = {
        categoryName: categoryName,
        description: description,
    };

    try {
        const response = await api.post("/admin/category/create", data, {
            headers: getHeader(),
        });
        if (response.status === 200 && response.data.status === "success") {
            return {
                success: true,
                message: response.data.message,
            };
        } else {
            return {
                success: false,
                message: response.data.message || "Failed to create category",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.response ? error.response.data.message : error.message,
        };
    }
}

export async function deleteCategory(categoryId) {
	try {
		const result = await api.delete(`/admin/category/delete/${categoryId}`, {
			headers: getHeader()
		});
		return result.data;
	} catch (error) {
		throw new Error(`Error deleting category: ${error.message}`);
	}
}

export async function updateCategory(categoryId, categoryName, description) {
    const data = {
        categoryName: categoryName,
        description: description,
    };

    try {
        const response = await api.put(`/admin/category/update/${categoryId}`, data, {
            headers: getHeader(),
        });
        return response.status === 200;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating category.");
    }
}

export async function getAllService() {
	try {
		const result = await api.get("/admin/service/all", {
			headers: getHeader(),
		});
		if (result.status === 204 || !result.data || result.data.length === 0) {
			return [];
		}
		return result.data;
	} catch (error) {
		console.error("Error fetching services:", error);
		throw new Error(`Error fetching services: ${error.response?.data?.message || error.message}`);
	}
}

export async function createService(serviceName, price, quantity, validityPeriod, description) {
    const data = {
        serviceName: serviceName,
		price: price,
		quantity: quantity,
		validityPeriod: validityPeriod,
        description: description,
    };

    try {
        const response = await api.post("/admin/service/create", data, {
            headers: getHeader(),
        });
        if (response.status === 200 && response.data.status === "success") {
            return {
                success: true,
                message: response.data.message,
            };
        } else {
            return {
                success: false,
                message: response.data.message || "Failed to create service",
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.response ? error.response.data.message : error.message,
        };
    }
}

export async function deleteService(serviceId) {
	try {
		const result = await api.delete(`/admin/service/delete/${serviceId}`, {
			headers: getHeader()
		});
		return result.data;
	} catch (error) {
		throw new Error(`Error deleting service: ${error.message}`);
	}
}

export async function updateService(servicePackId, serviceName, price, quantity, validityPeriod, description) {
    const data = {
        serviceName: serviceName,
		price: price,
		quantity: quantity,
		validityPeriod: validityPeriod,
        description: description
    };

    try {
        const response = await api.put(`/admin/service/update/${servicePackId}`, data, {
            headers: getHeader(),
        });
        return response.status === 200;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating service.");
    }
}

export async function getAllEmployers() {
	try {
		const result = await api.get("/employer/list-employer", {
			headers: getHeader(),
		});
		if (result.status === 204 || !result.data || result.data.length === 0) {
			return [];
		}
		return result.data;
	} catch (error) {
		console.error("Error fetching employers:", error);
		throw new Error(`Error fetching employers: ${error.response?.data?.message || error.message}`);
	}
}