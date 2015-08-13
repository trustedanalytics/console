/**
 * Copyright (c) 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function expectedQueryUrl(){
    var query = SERVICE_URL + '?query=';
    query += '%7B%22from%22%3A' + (CURRENT_PAGE - 1);
    query += '%2C%22size%22%3A' + PAGE_SIZE;
    if(scope.textToFind === ''){
        query += '%2C%22query%22%3A%7B%22match%22%3A%7B%22category%22%3A%22'+DEFAULT_CATEGORY+'%22%7D%7D%7D';
    }
    return query;
}
