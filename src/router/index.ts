import {createRouter, createWebHistory} from "vue-router";
import Home from '../views/home.vue'
import My from "../views/my/my.vue";
import {useUiStore} from "../store/ui.ts";
import useUserStore from "../store/user.ts";

const router=createRouter(
    {
        history:createWebHistory(),
        routes:[
            {
                path: '/',
                name:'home',
                component: Home
            },
            {
                name: 'video',
                path: '/video/:id',
                component: ()=> import('../views/video/video.vue'),
                props:true,
            },
            {
                path:'/my',
                component:My,
                children:[
                    {
                        path:'edit',
                        component:()=> import('../views/my/edit.vue')
                    },
                    {
                        path:'History',
                        component: ()=> import('../views/my/history.vue')
                    },
                    {
                        path:'favorites',
                        component: ()=> import('../views/my/favorites.vue')
                    },
                    {
                        path:'trends',
                        component: ()=> import('../views/my/trends.vue')
                    },
                    {
                        path:'News',
                        component: ()=> import('../views/my/news.vue')
                    }
                ],
                beforeEnter:() => {
                    const user = useUserStore()
                    const ui = useUiStore()
                    if (!user.isLogin) {
                        ui.openLogin()   // 打开登录弹窗
                        return false     // ✅ 关键：return false 表示取消当前路由跳转，停留在原页面
                    }
                    return true
                }
            },
            {
                path: '/search',
                name: 'Search',
                component: ()=> import('../views/SearchResult.vue')
            },
            {
                path:'/upload',
                name:'upload',
                component:()=> import('../views/upload.vue')
            }
        ]
    }
)

export default router;